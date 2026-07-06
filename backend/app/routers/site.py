import os
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.site_mode import PANEL_MODE, get_site_mode, set_site_mode

router = APIRouter(prefix="/api/site", tags=["site"])


@router.get("/mode", response_model=schemas.SiteModeResponse)
def read_site_mode(db: Session = Depends(get_db)):
    return schemas.SiteModeResponse(mode=get_site_mode(db))


def _telegram_secret() -> str | None:
    return os.getenv("TELEGRAM_WEBHOOK_SECRET") or os.getenv("TELEGRAM_BOT_TOKEN")


def _message_from_update(update: dict[str, Any]) -> dict[str, Any]:
    return update.get("message") or update.get("edited_message") or {}


@router.post("/telegram/{secret}")
async def telegram_webhook(secret: str, request: Request, db: Session = Depends(get_db)):
    expected_secret = _telegram_secret()
    if not expected_secret or secret != expected_secret:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Telegram webhook yetkisiz")

    update = await request.json()
    message = _message_from_update(update)
    chat = message.get("chat") or {}
    admin_chat_id = os.getenv("TELEGRAM_ADMIN_CHAT_ID")
    if admin_chat_id and str(chat.get("id")) != admin_chat_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu Telegram kullanıcısı yetkili değil")

    text = (message.get("text") or "").strip().split()[0].lower()
    if text == "/start":
        set_site_mode(db, PANEL_MODE)
        return {"ok": True, "mode": PANEL_MODE}

    return {"ok": True, "ignored": True, "mode": get_site_mode(db)}
