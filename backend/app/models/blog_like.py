import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class BlogLike(Base):
    """Composite primary key makes a double-like impossible by construction,
    not by application logic. The INSERT/DELETE trigger that keeps
    blogs.like_count in sync lives in Postgres
    (supabase/migrations/20260901000002_tables.sql) -- FastAPI never
    increments the counter itself."""

    __tablename__ = "blog_likes"

    blog_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("blogs.id", ondelete="CASCADE"), primary_key=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
