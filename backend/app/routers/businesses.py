from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app import models, schemas
from app.ai_client import generate_ad_copy
from app.database import get_db

router = APIRouter(prefix="/businesses", tags=["businesses"])


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
