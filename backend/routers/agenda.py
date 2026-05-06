from fastapi import APIRouter, HTTPException
from models.schemas import AgendaBlockCreate, AgendaBlockUpdate, AgendaBlockOut, DailyLogCreate, DailyLogOut
from models.database import get_db
from services.diagnostic import generate_daily_agenda
from datetime import date as dt_date

router = APIRouter(prefix="/users/{user_id}", tags=["Agenda & Journal"])


def _check_user(conn, user_id: int):
    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")
    return dict(row)


# ─── AGENDA BLOCKS ────────────────────────────────────────

@router.post("/agenda/generate", response_model=list[AgendaBlockOut], status_code=201)
def auto_generate_agenda(user_id: int, target_date: str | None = None):
    """
    Génère automatiquement les blocs d'agenda pour une journée
    selon le chronotype et les plans d'action en attente.
    """
    day = target_date or str(dt_date.today())

    with get_db() as conn:
        user = _check_user(conn, user_id)

        # Supprimer les blocs auto-générés existants pour ce jour
        conn.execute(
            "DELETE FROM agenda_blocks WHERE user_id = ? AND date = ?",
            (user_id, day),
        )

        plans = [
            dict(r)
            for r in conn.execute(
                "SELECT * FROM action_plans WHERE user_id = ? AND status = 'pending' ORDER BY difficulty",
                (user_id,),
            ).fetchall()
        ]

        blocks = generate_daily_agenda(user_id, day, user["chronotype"], plans)
        inserted = []
        for b in blocks:
            cur = conn.execute(
                """INSERT INTO agenda_blocks
                   (user_id, plan_id, title, block_type, energy_level, date, start_time, end_time, notes, done)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    b["user_id"], b["plan_id"], b["title"], b["block_type"],
                    b["energy_level"], b["date"], b["start_time"], b["end_time"],
                    b["notes"], 0,
                ),
            )
            row = conn.execute(
                "SELECT * FROM agenda_blocks WHERE id = ?", (cur.lastrowid,)
            ).fetchone()
            inserted.append(dict(row))
        return inserted


@router.post("/agenda", response_model=AgendaBlockOut, status_code=201)
def create_block(user_id: int, payload: AgendaBlockCreate):
    with get_db() as conn:
        _check_user(conn, user_id)
        cur = conn.execute(
            """INSERT INTO agenda_blocks
               (user_id, plan_id, title, block_type, energy_level, date, start_time, end_time, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                user_id, payload.plan_id, payload.title, payload.block_type,
                payload.energy_level, payload.date, payload.start_time,
                payload.end_time, payload.notes,
            ),
        )
        row = conn.execute(
            "SELECT * FROM agenda_blocks WHERE id = ?", (cur.lastrowid,)
        ).fetchone()
        return dict(row)


@router.get("/agenda", response_model=list[AgendaBlockOut])
def get_agenda(user_id: int, date: str | None = None, week: str | None = None):
    """
    date = YYYY-MM-DD pour une journée.
    week = YYYY-MM-DD (lundi) pour récupérer la semaine entière.
    Sans paramètre : retourne le mois courant.
    """
    with get_db() as conn:
        _check_user(conn, user_id)
        if date:
            rows = conn.execute(
                "SELECT * FROM agenda_blocks WHERE user_id = ? AND date = ? ORDER BY start_time",
                (user_id, date),
            ).fetchall()
        elif week:
            # Semaine = 7 jours à partir du lundi fourni
            rows = conn.execute(
                """SELECT * FROM agenda_blocks
                   WHERE user_id = ? AND date >= ? AND date < date(?, '+7 days')
                   ORDER BY date, start_time""",
                (user_id, week, week),
            ).fetchall()
        else:
            today = str(dt_date.today())
            rows = conn.execute(
                """SELECT * FROM agenda_blocks
                   WHERE user_id = ? AND date >= date(?, 'start of month')
                     AND date < date(?, 'start of month', '+1 month')
                   ORDER BY date, start_time""",
                (user_id, today, today),
            ).fetchall()
        return [dict(r) for r in rows]


@router.patch("/agenda/{block_id}", response_model=AgendaBlockOut)
def update_block(user_id: int, block_id: int, payload: AgendaBlockUpdate):
    with get_db() as conn:
        _check_user(conn, user_id)
        block = conn.execute(
            "SELECT * FROM agenda_blocks WHERE id = ? AND user_id = ?", (block_id, user_id)
        ).fetchone()
        if not block:
            raise HTTPException(status_code=404, detail="Bloc introuvable.")

        fields, values = [], []
        if payload.done is not None:
            fields.append("done = ?")
            values.append(1 if payload.done else 0)
        if payload.notes is not None:
            fields.append("notes = ?")
            values.append(payload.notes)

        if fields:
            values += [block_id, user_id]
            conn.execute(
                f"UPDATE agenda_blocks SET {', '.join(fields)} WHERE id = ? AND user_id = ?",
                values,
            )
        row = conn.execute(
            "SELECT * FROM agenda_blocks WHERE id = ?", (block_id,)
        ).fetchone()
        return dict(row)


@router.delete("/agenda/{block_id}", status_code=204)
def delete_block(user_id: int, block_id: int):
    with get_db() as conn:
        _check_user(conn, user_id)
        conn.execute(
            "DELETE FROM agenda_blocks WHERE id = ? AND user_id = ?", (block_id, user_id)
        )


# ─── JOURNAL QUOTIDIEN ────────────────────────────────────

@router.post("/logs", response_model=DailyLogOut, status_code=201)
def create_log(user_id: int, payload: DailyLogCreate):
    with get_db() as conn:
        _check_user(conn, user_id)
        existing = conn.execute(
            "SELECT id FROM daily_logs WHERE user_id = ? AND date = ?",
            (user_id, payload.date),
        ).fetchone()
        if existing:
            raise HTTPException(
                status_code=409,
                detail=f"Journal déjà existant pour le {payload.date}. Utilisez PATCH pour modifier.",
            )
        cur = conn.execute(
            """INSERT INTO daily_logs
               (user_id, date, energy_score, focus_score, mood_score, procrastinated, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                user_id, payload.date, payload.energy_score, payload.focus_score,
                payload.mood_score, int(payload.procrastinated), payload.notes,
            ),
        )
        row = conn.execute(
            "SELECT * FROM daily_logs WHERE id = ?", (cur.lastrowid,)
        ).fetchone()
        return dict(row)


@router.get("/logs", response_model=list[DailyLogOut])
def list_logs(user_id: int, limit: int = 30):
    with get_db() as conn:
        _check_user(conn, user_id)
        rows = conn.execute(
            "SELECT * FROM daily_logs WHERE user_id = ? ORDER BY date DESC LIMIT ?",
            (user_id, limit),
        ).fetchall()
        return [dict(r) for r in rows]


@router.get("/stats", tags=["Stats"])
def get_stats(user_id: int):
    """Retourne les statistiques globales de progression."""
    with get_db() as conn:
        _check_user(conn, user_id)

        logs = conn.execute(
            "SELECT * FROM daily_logs WHERE user_id = ? ORDER BY date DESC LIMIT 30",
            (user_id,),
        ).fetchall()

        plans_total = conn.execute(
            "SELECT COUNT(*) as n FROM action_plans WHERE user_id = ?", (user_id,)
        ).fetchone()["n"]

        plans_done = conn.execute(
            "SELECT COUNT(*) as n FROM action_plans WHERE user_id = ? AND status = 'completed'",
            (user_id,),
        ).fetchone()["n"]

        blocks_done = conn.execute(
            "SELECT COUNT(*) as n FROM agenda_blocks WHERE user_id = ? AND done = 1",
            (user_id,),
        ).fetchone()["n"]

        if logs:
            avg_energy = round(sum(r["energy_score"] for r in logs) / len(logs), 1)
            avg_focus = round(sum(r["focus_score"] for r in logs) / len(logs), 1)
            avg_mood = round(sum(r["mood_score"] for r in logs) / len(logs), 1)
            procr_days = sum(1 for r in logs if r["procrastinated"])
            procr_rate = round(procr_days / len(logs) * 100, 1)

            # Streak actuel (jours consécutifs sans procrastination)
            streak = 0
            for r in logs:
                if r["procrastinated"] == 0:
                    streak += 1
                else:
                    break
        else:
            avg_energy = avg_focus = avg_mood = 0.0
            procr_rate = 0.0
            streak = 0

        return {
            "user_id": user_id,
            "logs_count": len(logs),
            "avg_energy": avg_energy,
            "avg_focus": avg_focus,
            "avg_mood": avg_mood,
            "procrastination_rate_pct": procr_rate,
            "current_streak_days": streak,
            "plans_total": plans_total,
            "plans_completed": plans_done,
            "plans_completion_rate_pct": round(plans_done / plans_total * 100, 1) if plans_total else 0.0,
            "agenda_blocks_done": blocks_done,
        }
