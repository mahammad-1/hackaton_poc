from fastapi import APIRouter, HTTPException
from models.schemas import UserCreate, UserOut
from models.database import get_db

router = APIRouter(prefix="/users", tags=["Utilisateurs"])


@router.post("/", response_model=UserOut, status_code=201)
def create_user(payload: UserCreate):
    with get_db() as conn:
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ?", (payload.email,)
        ).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="Email déjà utilisé.")

        cur = conn.execute(
            "INSERT INTO users (name, email, chronotype) VALUES (?, ?, ?)",
            (payload.name, payload.email, payload.chronotype),
        )
        row = conn.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()
        return dict(row)


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Utilisateur introuvable.")
        return dict(row)


@router.get("/", response_model=list[UserOut])
def list_users():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM users ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int):
    with get_db() as conn:
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
