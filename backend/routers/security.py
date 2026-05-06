import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import httpx

router = APIRouter(prefix="/security", tags=["Securite"])


class CaptchaVerifyRequest(BaseModel):
    token: str = Field(..., min_length=1)


@router.post("/verify-captcha")
async def verify_captcha(payload: CaptchaVerifyRequest):
    secret = os.getenv("TURNSTILE_SECRET_KEY")
    if not secret:
        raise HTTPException(
            status_code=500,
            detail="TURNSTILE_SECRET_KEY manquant sur le backend.",
        )

    async with httpx.AsyncClient(timeout=8.0) as client:
        response = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={"secret": secret, "response": payload.token},
        )
        data = response.json()

    if not data.get("success", False):
        raise HTTPException(status_code=400, detail="Captcha invalide.")

    return {"success": True}
