from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


class BaseSchema(BaseModel):
    """Base schema with common Pydantic configuration"""

    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)

    @model_validator(mode="before")
    @classmethod
    def reject_null_bytes(cls, data: Any) -> Any:
        """Reject null bytes in string values to prevent database errors."""
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, str) and "\x00" in value:
                    raise ValueError(
                        f"Null bytes are not allowed in field '{key}'"
                    )
        return data


class TimestampMixin(BaseModel):
    """Mixin for entities with created_at/updated_at fields"""

    created_at: datetime
    updated_at: datetime


# Define your Pydantic schemas here
# Pattern: EntityBase -> EntityCreate/EntityUpdate -> Entity (response)


class BusinessImageBase(BaseSchema):
    public_url: str = Field(..., max_length=2048)
    object_key: str = Field(..., max_length=1024)
    original_filename: str = Field(..., max_length=255)
    content_type: str | None = Field(default=None, max_length=120)
    sort_order: int = Field(default=0, ge=0)


class BusinessImageCreate(BusinessImageBase):
    pass


class BusinessImage(BusinessImageBase):
    id: int
    business_id: int
    created_at: datetime


class BusinessBase(BaseSchema):
    business_name: str = Field(..., min_length=2, max_length=255)
    owner_name: str = Field(..., min_length=2, max_length=255)
    category: str = Field(..., min_length=2, max_length=120)
    niche: str = Field(..., min_length=2, max_length=255)
    city: str = Field(..., min_length=2, max_length=120)
    district: str | None = Field(default=None, max_length=120)
    summary: str = Field(..., min_length=1)
    services: str = Field(..., min_length=1)
    target_audience: str | None = Field(default=None, max_length=255)
    phone: str = Field(..., min_length=1, max_length=50)
    whatsapp: str | None = Field(default=None, max_length=50)
    address: str | None = None
    primary_image_url: str | None = Field(default=None, max_length=2048)
    primary_image_object_key: str | None = Field(default=None, max_length=1024)
    primary_image_original_filename: str | None = Field(default=None, max_length=255)
    generated_headline: str | None = Field(default=None, max_length=255)
    generated_subheadline: str | None = Field(default=None, max_length=255)
    generated_description: str | None = None
    google_ad_headlines: str | None = None
    google_ad_descriptions: str | None = None
    call_to_action: str | None = Field(default=None, max_length=120)
    is_published: bool = False


class BusinessCreate(BusinessBase):
    pass


class BusinessUpdate(BaseSchema):
    business_name: str | None = Field(default=None, min_length=2, max_length=255)
    owner_name: str | None = Field(default=None, min_length=2, max_length=255)
    category: str | None = Field(default=None, min_length=2, max_length=120)
    niche: str | None = Field(default=None, min_length=2, max_length=255)
    city: str | None = Field(default=None, min_length=2, max_length=120)
    district: str | None = Field(default=None, max_length=120)
    summary: str | None = Field(default=None, min_length=1)
    services: str | None = Field(default=None, min_length=1)
    target_audience: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, min_length=1, max_length=50)
    whatsapp: str | None = Field(default=None, max_length=50)
    address: str | None = None
    primary_image_url: str | None = Field(default=None, max_length=2048)
    primary_image_object_key: str | None = Field(default=None, max_length=1024)
    primary_image_original_filename: str | None = Field(default=None, max_length=255)
    generated_headline: str | None = Field(default=None, max_length=255)
    generated_subheadline: str | None = Field(default=None, max_length=255)
    generated_description: str | None = None
    google_ad_headlines: str | None = None
    google_ad_descriptions: str | None = None
    call_to_action: str | None = Field(default=None, max_length=120)
    is_published: bool | None = None


class Business(BusinessBase, TimestampMixin):
    id: int
    images: list[BusinessImage] = Field(default_factory=list)


class AdCopyRequest(BaseSchema):
    business_name: str = Field(..., min_length=2, max_length=255)
    category: str = Field(..., min_length=2, max_length=120)
    niche: str = Field(..., min_length=2, max_length=255)
    city: str = Field(..., min_length=2, max_length=120)
    summary: str = Field(..., min_length=20)
    services: str = Field(..., min_length=3)
    target_audience: str | None = Field(default=None, max_length=255)


class AdCopyResponse(BaseSchema):
    headline: str
    subheadline: str
    description: str
    google_ad_headlines: list[str]
    google_ad_descriptions: list[str]
    call_to_action: str


class IyzicoCheckoutRequest(BaseSchema):
    business_id: int | None = Field(default=None, ge=1)
    amount: str = Field(..., pattern=r"^\d+(\.\d{1,2})?$")
    buyer_name: str = Field(..., min_length=2, max_length=80)
    buyer_surname: str = Field(..., min_length=2, max_length=80)
    email: EmailStr
    phone: str = Field(..., min_length=7, max_length=50)
    identity_number: str = Field(..., min_length=5, max_length=30)
    registration_address: str = Field(..., min_length=5, max_length=255)
    city: str = Field(..., min_length=2, max_length=120)
    country: str = Field(default="Turkey", min_length=2, max_length=80)
    zip_code: str | None = Field(default=None, max_length=20)


class IyzicoCheckoutResponse(BaseSchema):
    conversation_id: str
    token: str | None = None
    payment_page_url: str | None = None
    checkout_form_content: str | None = None


class SiteModeResponse(BaseSchema):
    mode: str
