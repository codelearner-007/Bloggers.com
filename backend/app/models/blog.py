import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.attachment import Attachment
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin
from app.models.profile import Profile


class BlogStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class Blog(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "blogs"

    author_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    excerpt: Mapped[str | None] = mapped_column(Text, nullable=True)
    content_html: Mapped[str] = mapped_column(Text, nullable=False)
    content_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    cover_attachment_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("attachments.id", ondelete="SET NULL"), nullable=True
    )
    cover_url: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[BlogStatus] = mapped_column(
        Enum(BlogStatus, name="blog_status", values_callable=lambda e: [m.value for m in e]),
        nullable=False,
        default=BlogStatus.DRAFT,
    )
    like_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    reading_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    # search_vector is a generated column owned entirely by Postgres
    # (supabase/migrations/20260901000002_tables.sql) -- SQLAlchemy never
    # reads or writes it, so it is intentionally not mapped here.

    # Related class passed by NAME (not imported) so profile.py <-> blog.py
    # stays free of a circular import; SQLAlchemy resolves it lazily against
    # the shared declarative registry at mapper-configure time.
    author: Mapped["Profile"] = relationship("Profile", back_populates="blogs")
    cover_attachment: Mapped["Attachment | None"] = relationship(
        "Attachment", foreign_keys=[cover_attachment_id]
    )
