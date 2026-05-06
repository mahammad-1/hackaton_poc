
"""
Dépendance FastAPI pour les routes protégées.
Utilisation : ajouter `user_id: int = Depends(get_current_user)` dans n'importe quel endpoint.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.auth import decode_access_token
 
# Schéma Bearer : lit le token dans le header "Authorization: Bearer <token>"
bearer_scheme = HTTPBearer()
 
 
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> int:
    """
    Vérifie le token JWT et retourne l'user_id.
    Lève une 401 si le token est absent, expiré ou invalide.
    """
    token = credentials.credentials
    payload = decode_access_token(token)
 
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré. Veuillez vous reconnecter.",
            headers={"WWW-Authenticate": "Bearer"},
        )
 
    return int(payload["sub"])
 
