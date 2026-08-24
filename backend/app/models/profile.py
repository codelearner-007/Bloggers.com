import enum
import uuid

from sqlalchemy import Boolean, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin


class AppRole(str, enum.Enum):
    USER = "user"
    SUPER_ADMIN = "super_admin"


class Profile(Base, TimestampMixin):
    """Mirrors public.profiles. The row is created by the on_auth_user_created
    trigger on auth.users (see supabase/migrations/20260901000003_functions.sql),
    never by FastAPI -- so `id` is always the same UUID as the Supabase auth
    user, not a freshly generated one."""

    __tablename__ = "profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    email: Mapped[str] = mapped_column(String, nullable=False)
    username: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    full_name: Mapped[str | None] = mapped_column(String, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    website: Mapped[str | None] = mapped_column(String, nullable=True)
    auth_provider: Mapped[str] = mapped_column(String, nullable=False, default="google")
    provider_user_id: Mapped[str | None] = mapped_column(String, nullable=True)
    role: Mapped[AppRole] = mapped_column(
        Enum(AppRole, name="app_role", values_callable=lambda e: [m.value for m in e]),
        nullable=False,
        default=AppRole.USER,
    )
    is_banned: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # "Blog" passed by NAME, not imported -- blog.py imports profile.py, so
    # importing Blog here would be circular. SQLAlchemy resolves the string
    # lazily against the shared declarative registry at mapper-configure time.
    blogs: Mapped[list["Blog"]] = relationship("Blog", back_populates="author")
