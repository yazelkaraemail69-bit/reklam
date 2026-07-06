from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.database import Base


class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    business_name = Column(String(255), nullable=False, index=True)
    owner_name = Column(String(255), nullable=False)
    category = Column(String(120), nullable=False, index=True)
    niche = Column(String(255), nullable=False)
    city = Column(String(120), nullable=False, index=True)
    district = Column(String(120), nullable=True)
    summary = Column(Text, nullable=False)
    services = Column(Text, nullable=False)
    target_audience = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=False)
    whatsapp = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)

    primary_image_url = Column(String(2048), nullable=True)
    primary_image_object_key = Column(String(1024), nullable=True)
    primary_image_original_filename = Column(String(255), nullable=True)
    generated_headline = Column(String(255), nullable=True)
    generated_subheadline = Column(String(255), nullable=True)
    generated_description = Column(Text, nullable=True)
    google_ad_headlines = Column(Text, nullable=True)
    google_ad_descriptions = Column(Text, nullable=True)
    call_to_action = Column(String(120), nullable=True)
    is_published = Column(Boolean, nullable=False, server_default="false")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    images = relationship("BusinessImage", back_populates="business", cascade="all, delete-orphan")


class BusinessImage(Base):
    __tablename__ = "business_images"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    public_url = Column(String(2048), nullable=False)
    object_key = Column(String(1024), nullable=False)
    original_filename = Column(String(255), nullable=False)
    content_type = Column(String(120), nullable=True)
    sort_order = Column(Integer, nullable=False, server_default="0")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    business = relationship("Business", back_populates="images")
