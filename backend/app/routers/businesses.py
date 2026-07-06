import os
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session, selectinload

from app import models, schemas
from app.ai_client import generate_ad_copy
from app.database import get_db
from app.site_mode import SHOWCASE_MODE, set_site_mode

router = APIRouter(prefix="/businesses", tags=["businesses"])

ALLOWED_IMAGE_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024


def _uploads_dir() -> Path:
    return Path(os.getenv("UPLOAD_DIR", "uploads")).resolve()


def _public_upload_url(filename: str) -> str:
    public_backend_url = os.getenv("PUBLIC_BACKEND_URL", "").rstrip("/")
    path = f"/uploads/{filename}"
    return f"{public_backend_url}{path}" if public_backend_url else path


def _get_business_or_404(business_id: int, db: Session) -> models.Business:
    business = (
        db.query(models.Business)
        .options(selectinload(models.Business.images))
        .filter(models.Business.id == business_id)
        .first()
    )
    if business is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="İşletme bulunamadı")
    return business


@router.get("", response_model=list[schemas.Business])
def list_businesses(db: Session = Depends(get_db)):
    return (
        db.query(models.Business)
        .options(selectinload(models.Business.images))
        .order_by(models.Business.created_at.desc())
        .all()
    )


@router.post("", response_model=schemas.Business, status_code=status.HTTP_201_CREATED)
def create_business(payload: schemas.BusinessCreate, db: Session = Depends(get_db)):
    business = models.Business(**payload.model_dump())
    db.add(business)
    db.commit()
    db.refresh(business)
    set_site_mode(db, SHOWCASE_MODE)
    return _get_business_or_404(business.id, db)


@router.get("/{business_id}", response_model=schemas.Business)
def get_business(business_id: int, db: Session = Depends(get_db)):
    return _get_business_or_404(business_id, db)


@router.put("/{business_id}", response_model=schemas.Business)
def update_business(business_id: int, payload: schemas.BusinessUpdate, db: Session = Depends(get_db)):
    business = _get_business_or_404(business_id, db)
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(business, key, value)
    db.add(business)
    db.commit()
    db.refresh(business)
    return _get_business_or_404(business.id, db)


@router.delete("/{business_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_business(business_id: int, db: Session = Depends(get_db)):
    business = _get_business_or_404(business_id, db)
    db.delete(business)
    db.commit()
    return None


@router.post("/{business_id}/images", response_model=schemas.BusinessImage, status_code=status.HTTP_201_CREATED)
def add_business_image(business_id: int, payload: schemas.BusinessImageCreate, db: Session = Depends(get_db)):
    business = _get_business_or_404(business_id, db)
    image = models.BusinessImage(business_id=business.id, **payload.model_dump())
    db.add(image)

    if not business.primary_image_url:
        business.primary_image_url = payload.public_url
        business.primary_image_object_key = payload.object_key
        business.primary_image_original_filename = payload.original_filename
        db.add(business)

    db.commit()
    db.refresh(image)
    return image


@router.post("/{business_id}/images/upload", response_model=schemas.BusinessImage, status_code=status.HTTP_201_CREATED)
def upload_business_image(
    business_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    business = _get_business_or_404(business_id, db)
    extension = ALLOWED_IMAGE_TYPES.get(file.content_type or "")
    if not extension:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sadece JPG, PNG veya WEBP görsel yüklenebilir",
        )

    content = file.file.read(MAX_IMAGE_SIZE_BYTES + 1)
    if len(content) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Görsel boyutu en fazla 5 MB olabilir",
        )

    uploads_dir = _uploads_dir()
    uploads_dir.mkdir(parents=True, exist_ok=True)
    safe_filename = f"{business.id}-{uuid4().hex}{extension}"
    target_path = uploads_dir / safe_filename
    target_path.write_bytes(content)

    image = models.BusinessImage(
        business_id=business.id,
        public_url=_public_upload_url(safe_filename),
        object_key=safe_filename,
        original_filename=file.filename or safe_filename,
        content_type=file.content_type,
        sort_order=len(business.images),
    )
    db.add(image)

    if not business.primary_image_url:
        business.primary_image_url = image.public_url
        business.primary_image_object_key = image.object_key
        business.primary_image_original_filename = image.original_filename
        db.add(business)

    db.commit()
    db.refresh(image)
    return image


@router.post("/{business_id}/generate-content", response_model=schemas.Business)
def generate_business_content(business_id: int, db: Session = Depends(get_db)):
    business = _get_business_or_404(business_id, db)
    generated = generate_ad_copy(
        schemas.AdCopyRequest(
            business_name=business.business_name,
            category=business.category,
            niche=business.niche,
            city=business.city,
            summary=business.summary,
            services=business.services,
            target_audience=business.target_audience,
        )
    )
    business.generated_headline = generated.headline
    business.generated_subheadline = generated.subheadline
    business.generated_description = generated.description
    business.google_ad_headlines = "\n".join(generated.google_ad_headlines)
    business.google_ad_descriptions = "\n".join(generated.google_ad_descriptions)
    business.call_to_action = generated.call_to_action
    db.add(business)
    db.commit()
    db.refresh(business)
    return _get_business_or_404(business.id, db)
