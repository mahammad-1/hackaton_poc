from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr, Field
from models.database import get_db
from services.auth import hash_password, verify_password, create_access_token
from dependencies import get_current_user
 
router = APIRouter(prefix="/auth", tags=["Authentification"])
 
 
# ─── SCHÉMAS ──────────────────────────────────────────────
 
class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    chronotype: str = "intermediate"  # morning / evening / intermediate
 
 
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
 
 
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    email: str
 
 
# ─── ENDPOINTS ────────────────────────────────────────────
 
@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest):
    """Crée un compte et retourne un token JWT."""
    with get_db() as conn:
        # Vérifier que l'email n'est pas déjà utilisé
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ?", (payload.email,)
        ).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="Cet email est déjà utilisé.")
 
        # Hasher le mot de passe avant de le stocker
        hashed = hash_password(payload.password)
 
        # Ajouter la colonne password_hash si elle n'existe pas encore
        conn.execute(
            """INSERT INTO users (name, email, password_hash, chronotype)
               VALUES (?, ?, ?, ?)""",
            (payload.name, payload.email, hashed, payload.chronotype),
        )
        user = conn.execute(
            "SELECT * FROM users WHERE email = ?", (payload.email,)
        ).fetchone()
 
    token = create_access_token(user["id"], user["email"])
    return TokenResponse(
        access_token=token,
        user_id=user["id"],
        name=user["name"],
        email=user["email"],
    )
 
 
@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    """Vérifie les identifiants et retourne un token JWT."""
    with get_db() as conn:
        user = conn.execute(
            "SELECT * FROM users WHERE email = ?", (payload.email,)
        ).fetchone()
 
    if not user:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect.")
 
    if not user["password_hash"]:
        raise HTTPException(status_code=401, detail="Compte sans mot de passe. Utilisez /register.")
 
    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect.")
 
    token = create_access_token(user["id"], user["email"])
    return TokenResponse(
        access_token=token,
        user_id=user["id"],
        name=user["name"],
        email=user["email"],
    )
 
 
@router.get("/me", response_model=dict)
def get_me(user_id: int = Depends(get_current_user)):
    """Retourne le profil de l'utilisateur connecté."""
    with get_db() as conn:
        user = conn.execute(
            "SELECT id, name, email, chronotype, created_at FROM users WHERE id = ?",
            (user_id,)
        ).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur introuvable.")
        return dict(user)
 
