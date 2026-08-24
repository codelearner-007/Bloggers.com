import enum
import uuid
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import UUIDPrimaryKeyMixin


class AttachmentKind(str, enum.Enum):
    COVER = "cover"
    INLINE = "inline"


class AttachmentStatus(str, enum.Enum):
    PENDING = "pending"
    COMMITTED = "committed"


class Attachment(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "attachments"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False
    )
    bucket: Mapped[str] = mapped_column(String, nullable=False, default="blog-media")
    object_path: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    public_url: Mapped[str] = mapped_column(String, nullable=False)
    mime_type: Mapped[str] = mapped_column(String, nullable=False)
    size_bytes: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    original_file_name: Mapped[str | None] = mapped_column(String, nullable=True)
    kind: Mapped[AttachmentKind] = mapped_column(
        Enum(AttachmentKind, name="attachment_kind", values_callable=lambda e: [m.value for m in e]),
        nullable=False,
    )
    status: Mapped[AttachmentStatus] = mapped_column(
        Enum(AttachmentStatus, name="attachment_status", values_callable=lambda e: [m.value for m in e]),
        nullable=False,
        default=AttachmentStatus.PENDING,
    )
    # created_at only -- attachments are immutable once written, there is no
    # updated_at column on this table.
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class BlogAttachment(Base):
    """The join table that makes cascading storage cleanup possible: every
    inline/cover image a blog uses is looked up through here before the blog
    row (and then the attachment rows) are deleted. See
    services/blog_service.py delete_blog -- storage objects are removed
    before the database rows, never the other way round."""

    __tablename__ = "blog_attachments"

    blog_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("blogs.id", ondelete="CASCADE"), primary_key=True
    )
    attachment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("attachments.id", ondelete="CASCADE"), primary_key=True
    )
