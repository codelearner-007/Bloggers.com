import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.profile import AppRole


class AuthorOut(BaseModel):
    """The public-safe subset of a profile -- no email, no role, no
    is_banned. Those columns are also revoked from anon/authenticated at the
    database level (see the RLS migration); this schema mirrors that same
    boundary on the FastAPI side."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    username: str
    full_name: str | None
    avatar_url: str | None
    bio: str | None = None


class ProfileOut(BaseModel):
    """The caller's own profile -- includes fields only they should see about
    themselves, still never a password (there is none)."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    username: str
    full_name: str | None
    avatar_url: str | None
    bio: str | None
    website: str | None
    role: AppRole
    created_at: datetime
