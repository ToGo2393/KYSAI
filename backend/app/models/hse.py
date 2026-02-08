from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class HSEReport(Base):
    __tablename__ = "hse_reports"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String, nullable=False)
    non_conformities = Column(JSON, default=[])  # List of strings
    user_observations = Column(String, nullable=True)
    corrective_actions = Column(JSON, default=[])  # List of suggested actions
    status = Column(String, default="draft")
    
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    organization = relationship("Organization", back_populates="hse_reports")
    author = relationship("User", back_populates="hse_reports")
