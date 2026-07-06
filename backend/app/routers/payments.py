import base64
import hashlib
import hmac
from html import escape
import json
import os
from decimal import Decimal, ROUND_HALF_UP
from uuid import uuid4
from urllib.parse import urlencode, urljoin, urlsplit

import httpx
from fastapi import APIRouter, Depends, Form, HTTPException, status
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/payments", tags=["payments"])


def _money(value: str) -> str:
    amount = Decimal(value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    if amount <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ödeme tutarı 0'dan büyük olmalıdır")
    return format(amount, "f")


def _setting(name: str, *, required: bool = True, default: str | None = None) -> str:
    value = os.getenv(name, default)
    if required and not value:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"{name} ortam değişkeni tanımlı değil",
        )
    return value or ""


def _iyzico_base_url() -> str:
    return _setting("IYZICO_BASE_URL", required=False, default="https://sandbox-api.iyzipay.com").rstrip("/")


def _callback_url() -> str:
    explicit = os.getenv("IYZICO_CALLBACK_URL")
    if explicit:
        return explicit

    public_backend_url = os.getenv("PUBLIC_BACKEND_URL")
    if public_backend_url:
        return urljoin(public_backend_url.rstrip("/") + "/", "api/payments/iyzico/callback")

    return "http://localhost:8000/api/payments/iyzico/callback"


def _json_body(payload: dict) -> str:
    return json.dumps(payload, ensure_ascii=False, separators=(",", ":"))


def _authorization_header(api_key: str, secret_key: str, url: str, body: str, random_key: str) -> str:
    path = urlsplit(url).path
    signature_payload = f"{random_key}{path}{body}".encode("utf-8")
    digest = hmac.new(secret_key.encode("utf-8"), signature_payload, hashlib.sha256).digest()
    signature = base64.b64encode(digest).decode("utf-8")
    return f"IYZWSv2 {api_key}:{random_key}:{signature}"


def _business_for_payment(db: Session, business_id: int | None) -> models.Business | None:
    if business_id is None:
        return None
    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    if business is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="İşletme bulunamadı")
    return business


def _frontend_url() -> str:
    return os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")


def _payment_result_url(status_value: str, token: str) -> str:
    query = {"payment": status_value}
    if token:
        query["token"] = token
    return f"{_frontend_url()}/?{urlencode(query)}"


@router.post("/iyzico/checkout", response_model=schemas.IyzicoCheckoutResponse)
def create_iyzico_checkout(payload: schemas.IyzicoCheckoutRequest, db: Session = Depends(get_db)):
    api_key = _setting("IYZICO_API_KEY")
    secret_key = _setting("IYZICO_SECRET_KEY")
    base_url = _iyzico_base_url()
    url = f"{base_url}/payment/iyzipos/checkoutform/initialize/auth/ecom"

    amount = _money(payload.amount)
    conversation_id = f"ad-{uuid4().hex}"
    business = _business_for_payment(db, payload.business_id)
    item_name = business.business_name if business else "İşletme reklam yayın paketi"
    category = business.category if business else "Reklam"

    request_payload = {
        "locale": "tr",
        "conversationId": conversation_id,
        "price": amount,
        "paidPrice": amount,
        "currency": "TRY",
        "basketId": conversation_id,
        "paymentGroup": "PRODUCT",
        "callbackUrl": _callback_url(),
        "buyer": {
            "id": str(payload.business_id or conversation_id),
            "name": payload.buyer_name,
            "surname": payload.buyer_surname,
            "gsmNumber": payload.phone,
            "email": payload.email,
            "identityNumber": payload.identity_number,
            "registrationAddress": payload.registration_address,
            "city": payload.city,
            "country": payload.country,
            "zipCode": payload.zip_code or "00000",
        },
        "shippingAddress": {
            "contactName": f"{payload.buyer_name} {payload.buyer_surname}",
            "city": payload.city,
            "country": payload.country,
            "address": payload.registration_address,
            "zipCode": payload.zip_code or "00000",
        },
        "billingAddress": {
            "contactName": f"{payload.buyer_name} {payload.buyer_surname}",
            "city": payload.city,
            "country": payload.country,
            "address": payload.registration_address,
            "zipCode": payload.zip_code or "00000",
        },
        "basketItems": [
            {
                "id": str(payload.business_id or "ad-package"),
                "name": item_name,
                "category1": category,
                "itemType": "VIRTUAL",
                "price": amount,
            }
        ],
    }

    body = _json_body(request_payload)
    random_key = uuid4().hex
    headers = {
        "Authorization": _authorization_header(api_key, secret_key, url, body, random_key),
        "Content-Type": "application/json",
        "Accept": "application/json",
        "x-iyzi-rnd": random_key,
    }

    try:
        response = httpx.post(url, content=body.encode("utf-8"), headers=headers, timeout=20)
        response.raise_for_status()
        data = response.json()
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Iyzico ödeme servisine ulaşılamadı",
        ) from exc

    if data.get("status") != "success":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=data.get("errorMessage") or "Iyzico ödeme formu başlatılamadı",
        )

    return schemas.IyzicoCheckoutResponse(
        conversation_id=conversation_id,
        token=data.get("token"),
        payment_page_url=data.get("paymentPageUrl"),
        checkout_form_content=data.get("checkoutFormContent"),
    )


@router.post("/iyzico/callback")
def iyzico_callback(status_value: str = Form(alias="status"), token: str = Form(default="")):
    target = _payment_result_url(status_value, token)
    return RedirectResponse(target, status_code=status.HTTP_303_SEE_OTHER)


@router.get("/iyzico/callback")
def iyzico_callback_get(status_value: str = "unknown", token: str = ""):
    target = _payment_result_url(status_value, token)
    safe_target = escape(target, quote=True)
    return HTMLResponse(
        f'<html><head><meta http-equiv="refresh" content="0; url={safe_target}"></head>'
        f'<body>Ödeme sonucu için <a href="{safe_target}">siteye dön</a>.</body></html>'
    )
