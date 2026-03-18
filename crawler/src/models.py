"""SQLAlchemy models for crawler database tables."""

import json
from datetime import datetime
from enum import Enum
from typing import Any, Optional

from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    Enum as SQLEnum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

Base = declarative_base()


class CrawlJobStatus(str, Enum):
    """Status of a crawl job."""

    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    PAUSED = "PAUSED"


class ReviewStatus(str, Enum):
    """Review status of a crawled recipe."""

    PENDING = "PENDING"
    AUTO_APPROVED = "AUTO_APPROVED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    FLAGGED = "FLAGGED"


class ExtractionTier(str, Enum):
    """Which extraction tier was used."""

    TIER_1_STRUCTURED = "TIER_1_STRUCTURED"
    TIER_2_LLM = "TIER_2_LLM"
    TIER_3_VISION = "TIER_3_VISION"
    FAILED = "FAILED"


class CrawlJob(Base):
    """Model representing a crawl job for a chef."""

    __tablename__ = "crawl_jobs"

    id = Column(String(36), primary_key=True, index=True)
    chef_id = Column(String(36), nullable=False, index=True)
    status = Column(SQLEnum(CrawlJobStatus), default=CrawlJobStatus.PENDING, index=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    recipes_found = Column(Integer, default=0)
    recipes_approved = Column(Integer, default=0)
    max_recipes = Column(Integer, default=10)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    crawled_recipes = relationship("CrawledRecipe", back_populates="job")
    logs = relationship("CrawlLog", back_populates="job")

    def __repr__(self) -> str:
        return f"<CrawlJob(id={self.id}, chef_id={self.chef_id}, status={self.status})>"


class CrawledRecipe(Base):
    """Model representing a crawled recipe."""

    __tablename__ = "crawled_recipes"

    id = Column(String(36), primary_key=True, index=True)
    job_id = Column(String(36), ForeignKey("crawl_jobs.id"), nullable=False, index=True)
    chef_id = Column(String(36), nullable=False, index=True)
    source_url = Column(String(2048), nullable=False, unique=True, index=True)
    extraction_tier = Column(
        SQLEnum(ExtractionTier), default=ExtractionTier.FAILED, nullable=False
    )
    confidence_score = Column(Float, nullable=False, default=0.0)
    raw_data = Column(JSON, nullable=False)
    normalized_data = Column(JSON, nullable=True)
    review_status = Column(SQLEnum(ReviewStatus), default=ReviewStatus.PENDING, index=True)
    review_score = Column(Integer, nullable=True)
    reviewer_notes = Column(Text, nullable=True)
    reviewed_by = Column(String(36), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    job = relationship("CrawlJob", back_populates="crawled_recipes")

    def __repr__(self) -> str:
        return f"<CrawledRecipe(id={self.id}, source_url={self.source_url[:50]})>"

    def to_dict(self) -> dict[str, Any]:
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "job_id": self.job_id,
            "chef_id": self.chef_id,
            "source_url": self.source_url,
            "extraction_tier": self.extraction_tier.value if isinstance(self.extraction_tier, ExtractionTier) else self.extraction_tier,
            "confidence_score": self.confidence_score,
            "raw_data": self.raw_data,
            "normalized_data": self.normalized_data,
            "review_status": self.review_status.value if isinstance(self.review_status, ReviewStatus) else self.review_status,
            "review_score": self.review_score,
            "reviewer_notes": self.reviewer_notes,
            "reviewed_by": self.reviewed_by,
            "reviewed_at": self.reviewed_at,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }


class CrawlLog(Base):
    """Model representing a log entry for a crawl job."""

    __tablename__ = "crawl_logs"

    id = Column(String(36), primary_key=True, index=True)
    job_id = Column(String(36), ForeignKey("crawl_jobs.id"), nullable=False, index=True)
    level = Column(String(20), nullable=False, index=True)
    message = Column(Text, nullable=False)
    context = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)

    # Relationships
    job = relationship("CrawlJob", back_populates="logs")

    def __repr__(self) -> str:
        return f"<CrawlLog(job_id={self.job_id}, level={self.level})>"


class DatabaseManager:
    """Manages database connections and session creation."""

    def __init__(self, database_url: str) -> None:
        """Initialize database manager.

        Args:
            database_url: PostgreSQL connection string.
        """
        self.database_url = database_url
        self.engine = create_engine(
            database_url,
            echo=False,
            future=True,
            connect_args={"check_same_thread": False} if "sqlite" in database_url else {},
        )
        self.SessionLocal = sessionmaker(bind=self.engine, expire_on_commit=False)

    def create_tables(self) -> None:
        """Create all tables in the database."""
        Base.metadata.create_all(bind=self.engine)

    def drop_tables(self) -> None:
        """Drop all tables from the database. WARNING: Destructive operation."""
        Base.metadata.drop_all(bind=self.engine)

    def get_session(self):
        """Get a new database session."""
        return self.SessionLocal()

    def close(self) -> None:
        """Close all connections."""
        self.engine.dispose()
