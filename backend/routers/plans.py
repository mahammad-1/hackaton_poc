from fastapi import APIRouter, HTTPException
from models.schemas import ActionPlanCreate, ActionPlanUpdate, ActionPlanOut
from models.database import get_db
from services.diagnostic import generate_action_plans

router = APIRouter(prefix="/users/{user_id}/plans", tags=["Plans d'action"])


def _check_user(conn, user_id: int):
    if not conn.execute("SELECT id FROM users WHERE id = ?", (user_id,)).fetchone():
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")


@router.post("/generate", response_model=list[ActionPlanOut], status_code=201)
def auto_generate_plans(user_id: int):
    """Génère automatiquement les plans d'action à partir des causes enregistrées."""
    with get_db() as conn:
        _check_user(conn, user_id)
        causes = [
            dict(r)
            for r in conn.execute(
                "SELECT * FROM procrastination_causes WHERE user_id = ?", (user_id,)
            ).fetchall()
        ]
        if not causes:
            raise HTTPException(
                status_code=422,
                detail="Aucune cause enregistrée. Ajoutez d'abord vos causes de procrastination.",
            )

        plans = generate_action_plans(user_id, causes)
        inserted = []
        for p in plans:
            cur = conn.execute(
                """INSERT INTO action_plans
                   (user_id, cause_id, title, protocol, description, duration_min, difficulty, status)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    p["user_id"], p["cause_id"], p["title"], p["protocol"],
                    p["description"], p["duration_min"], p["difficulty"], p["status"],
                ),
            )
            row = conn.execute(
                "SELECT * FROM action_plans WHERE id = ?", (cur.lastrowid,)
            ).fetchone()
            inserted.append(dict(row))
        return inserted


@router.post("/", response_model=ActionPlanOut, status_code=201)
def create_plan(user_id: int, payload: ActionPlanCreate):
    with get_db() as conn:
        _check_user(conn, user_id)
        cur = conn.execute(
            """INSERT INTO action_plans
               (user_id, cause_id, title, protocol, description, duration_min, difficulty, scheduled_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                user_id, payload.cause_id, payload.title, payload.protocol,
                payload.description, payload.duration_min, payload.difficulty,
                payload.scheduled_at,
            ),
        )
        row = conn.execute(
            "SELECT * FROM action_plans WHERE id = ?", (cur.lastrowid,)
        ).fetchone()
        return dict(row)


@router.get("/", response_model=list[ActionPlanOut])
def list_plans(user_id: int, status: str | None = None):
    with get_db() as conn:
        _check_user(conn, user_id)
        if status:
            rows = conn.execute(
                "SELECT * FROM action_plans WHERE user_id = ? AND status = ? ORDER BY difficulty",
                (user_id, status),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM action_plans WHERE user_id = ? ORDER BY difficulty",
                (user_id,),
            ).fetchall()
        return [dict(r) for r in rows]


@router.patch("/{plan_id}", response_model=ActionPlanOut)
def update_plan(user_id: int, plan_id: int, payload: ActionPlanUpdate):
    with get_db() as conn:
        _check_user(conn, user_id)
        plan = conn.execute(
            "SELECT * FROM action_plans WHERE id = ? AND user_id = ?", (plan_id, user_id)
        ).fetchone()
        if not plan:
            raise HTTPException(status_code=404, detail="Plan introuvable.")

        fields, values = [], []
        if payload.status is not None:
            fields.append("status = ?")
            values.append(payload.status)
        if payload.scheduled_at is not None:
            fields.append("scheduled_at = ?")
            values.append(payload.scheduled_at)
        if payload.completed_at is not None:
            fields.append("completed_at = ?")
            values.append(payload.completed_at)

        if fields:
            values += [plan_id, user_id]
            conn.execute(
                f"UPDATE action_plans SET {', '.join(fields)} WHERE id = ? AND user_id = ?",
                values,
            )
        row = conn.execute(
            "SELECT * FROM action_plans WHERE id = ?", (plan_id,)
        ).fetchone()
        return dict(row)


@router.delete("/{plan_id}", status_code=204)
def delete_plan(user_id: int, plan_id: int):
    with get_db() as conn:
        _check_user(conn, user_id)
        conn.execute(
            "DELETE FROM action_plans WHERE id = ? AND user_id = ?", (plan_id, user_id)
        )
