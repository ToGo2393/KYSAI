from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .base import Base

class UserRole(enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    MEMBER = "member"

class ReportType(enum.Enum):
    EIGHT_D = "8D"
    FIVE_S = "5S"
    KAIZEN = "Kaizen"
    FISHBONE = "Fishbone"

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    users = relationship("User", back_populates="organization")
    reports = relationship("QualityReport", back_populates="organization")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.MEMBER)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    organization = relationship("Organization", back_populates="users")
    reports = relationship("QualityReport", back_populates="author")

class QualityReport(Base):
    __tablename__ = "quality_reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    report_type = Column(Enum(ReportType), nullable=False)
    status = Column(String, default="draft") # draft, submitted, approved
    
    # Critical: Using JSONB for semi-structured data allows flexibility for different report templates
    # without needing schema migrations for every new report field.
    data = Column(JSON, nullable=False, default={}) 
    
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    organization = relationship("Organization", back_populates="reports")
    author = relationship("User", back_populates="reports")

from .hse import HSEReport  # Import at end to avoid circular imports during definition, or handle carefully
# Actually, better to use string forward references which we did in hse.py. 
# But we need Oganization and User to know about hse_reports.
# We can inject the relationship now.

Organization.hse_reports = relationship("HSEReport", back_populates="organization")
User.hse_reports = relationship("HSEReport", back_populates="author")
