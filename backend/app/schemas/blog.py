import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.blog import BlogStatus
from app.schemas.profile import AuthorOut


class BlogCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    excerpt: str | None = Field(default=None, max_length=500)
    # Raw HTML from TipTap. FastAPI sanitises this with nh3 before it ever
    # touches the database -- see utils/html_sanitizer.py. The browser has no
    # UPDATE/INSERT grant on blogs at all, so this is the ONLY path unsafe
    # HTML could reach a reader through.
    content_html: str
    # The TipTap JSON document, kept alongside the HTML so re-opening the
    # editor is lossless instead of re-parsing rendered HTML back into a doc.
    content_json: dict[str, Any] | None = None
    cover_attachment_id: uuid.UUID | None = None
    status: BlogStatus = BlogStatus.DRAFT


class BlogUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    excerpt: str | None = Field(default=None, max_length=500)
    content_html: str | None = None
    content_json: dict[str, Any] | None = None
    cover_attachment_id: uuid.UUID | None = None
    status: BlogStatus | None = None


class BlogListItemOut(BaseModel):
    """The shape used for list views (my-blogs, admin/blogs) -- no
    content_html/content_json, which can be large and are never needed in a
    list row."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    slug: str
    excerpt: str | None
    cover_url: str | None
    status: BlogStatus
    like_count: int
    reading_minutes: int | None
    published_at: datetime | None
    created_at: datetime


class BlogOut(BlogListItemOut):
    content_html: str
    content_json: dict[str, Any] | None
    author: AuthorOut
