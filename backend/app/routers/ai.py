from fastapi import APIRouter

from app import schemas
from app.ai_client import generate_ad_copy

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/ad-copy", response_model=schemas.AdCopyResponse)
def create_ad_copy(payload: schemas.AdCopyRequest):
    return generate_ad_copy(payload)
