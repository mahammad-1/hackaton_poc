from fastapi import APIRouter, HTTPException
from models.schemas import BadHabitCreate, BadHabitOut, CauseCreate, CauseOut, DiagnosticReport
from models.database import get_db
from services.diagnostic import compute_diagnostic

router = APIRouter(prefix="/users/{user_id}", tags=["Diagnostic"])


def _check_user(conn, user_id: int):
    row = conn.execute("SELECT id FROM users WHERE id = ?", (user_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")


# ─── MAUVAISES HABITUDES ──────────────────────────────────

@router.post("/habits", response_model=BadHabitOut, status_code=201)
def add_habit(user_id: int, payload: BadHabitCreate):
    with get_db() as conn:
        _check_user(conn, user_id)
        cur = conn.execute(
            "INSERT INTO bad_habits (user_id, label, category, severity) VALUES (?, ?, ?, ?)",
            (user_id, payload.label, payload.category, payload.severity),
        )
        row = conn.execute("SELECT * FROM bad_habits WHERE id = ?", (cur.lastrowid,)).fetchone()
        return dict(row)


@router.get("/habits", response_model=list[BadHabitOut])
def list_habits(user_id: int):
    with get_db() as conn:
        _check_user(conn, user_id)
        rows = conn.execute(
            "SELECT * FROM bad_habits WHERE user_id = ? ORDER BY severity DESC",
            (user_id,),
        ).fetchall()
        return [dict(r) for r in rows]


@router.delete("/habits/{habit_id}", status_code=204)
def delete_habit(user_id: int, habit_id: int):
    with get_db() as conn:
        _check_user(conn, user_id)
        conn.execute(
            "DELETE FROM bad_habits WHERE id = ? AND user_id = ?", (habit_id, user_id)
        )


# ─── CAUSES DE PROCRASTINATION ────────────────────────────

@router.post("/causes", response_model=CauseOut, status_code=201)
def add_cause(user_id: int, payload: CauseCreate):
    with get_db() as conn:
        _check_user(conn, user_id)
        cur = conn.execute(
            """INSERT INTO procrastination_causes
               (user_id, cause_type, description, trigger_time, trigger_context, frequency)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                user_id,
                payload.cause_type,
                payload.description,
                payload.trigger_time,
                payload.trigger_context,
                payload.frequency,
            ),
        )
        row = conn.execute(
            "SELECT * FROM procrastination_causes WHERE id = ?", (cur.lastrowid,)
        ).fetchone()
        return dict(row)


@router.get("/causes", response_model=list[CauseOut])
def list_causes(user_id: int):
    with get_db() as conn:
        _check_user(conn, user_id)
        rows = conn.execute(
            "SELECT * FROM procrastination_causes WHERE user_id = ? ORDER BY frequency DESC",
            (user_id,),
        ).fetchall()
        return [dict(r) for r in rows]


@router.delete("/causes/{cause_id}", status_code=204)
def delete_cause(user_id: int, cause_id: int):
    with get_db() as conn:
        _check_user(conn, user_id)
        conn.execute(
            "DELETE FROM procrastination_causes WHERE id = ? AND user_id = ?",
            (cause_id, user_id),
        )


# ─── RAPPORT DE DIAGNOSTIC ────────────────────────────────

@router.get("/diagnostic", response_model=DiagnosticReport)
def get_diagnostic(user_id: int):
    with get_db() as conn:
        _check_user(conn, user_id)
        causes = [
            dict(r)
            for r in conn.execute(
                "SELECT * FROM procrastination_causes WHERE user_id = ?", (user_id,)
            ).fetchall()
        ]
        habits = [
            dict(r)
            for r in conn.execute(
                "SELECT * FROM bad_habits WHERE user_id = ?", (user_id,)
            ).fetchall()
        ]
    return compute_diagnostic(user_id, causes, habits)
