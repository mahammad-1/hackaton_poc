
"""
Service d'authentification.
- Hashage des mots de passe avec bcrypt
- Génération et vérification des tokens JWT
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
 
# ─── CONFIG ───────────────────────────────────────────────
# En production : mettre dans une variable d'environnement (.env)
SECRET_KEY = "neurflow-secret-key-change-in-production-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 jours
 
# Contexte argon2 pour hasher les mots de passe (plus moderne que bcrypt)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
 
 
# ─── MOT DE PASSE ─────────────────────────────────────────
 
def hash_password(plain_password: str) -> str:
    """Transforme un mot de passe en clair en hash bcrypt."""
    return pwd_context.hash(plain_password)
 
 
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie qu'un mot de passe correspond à son hash."""
    return pwd_context.verify(plain_password, hashed_password)
 
 
# ─── JWT TOKEN ────────────────────────────────────────────
 
def create_access_token(user_id: int, email: str) -> str:
    """Génère un token JWT contenant l'id et l'email de l'utilisateur."""
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),   # subject = identifiant unique
        "email": email,
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
 
 
def decode_access_token(token: str) -> Optional[dict]:
    """
    Décode un token JWT.
    Retourne le payload si valide, None si expiré ou invalide.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
