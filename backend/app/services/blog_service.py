import re
from datetime import datetime, timezone
from math import ceil
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.dependencies.auth import load_owned_blog
from app.models.attachment import Attachment, BlogAttachment
from app.models.blog import Blog, BlogStatus
from app.models.profile import Profile
from app.schemas.blog import BlogCreate, BlogUpdate
from app.utils.html_sanitizer import sanitize_blog_html
from app.utils.slug import generate_unique_slug
from app.utils.supabase_admin import get_supabase_admin

WORDS_PER_MINUTE = 200

_TAG_RE = re.compile(r"<[^>]+>")


def list_blogs_for_author(db, author_id, page=1, page_size=12, search=None, status=None):
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    statement = (
        select(Blog, func.count().over().label("total_items"))
        .options(joinedload(Blog.cover_attachment))
        .where(Blog.author_id == author_id)
    )
    if status is not None:
        statement = statement.where(Blog.status == status)
    if search:
        pattern = f"%{search}%"
        statement = statement.where(Blog.title.ilike(pattern))
    statement = (
        statement.order_by(Blog.created_at.desc(), Blog.id.desc())
        .limit(page_size).offset((page - 1) * page_size)
    )
    rows = db.execute(statement).unique().all()
    total_items = rows[0].total_items if rows else 0
    return {
        "items": [row.Blog for row in rows],
        "meta": {
            "page": page, "page_size": page_size, "total_items": total_items,
            "total_pages": max(1, ceil(total_items / page_size)),
            "has_next": page * page_size < total_items, "has_prev": page > 1,
        },
    }


def _estimate_reading_minutes(html: str) -> int:
    text = _TAG_RE.sub(" ", html)
    word_count = len(text.split())
    return max(1, ceil(word_count / WORDS_PER_MINUTE))


def _resolve_cover_attachment(db: Session, owner_id: UUID, attachment_id: UUID) -> Attachment:
    attachment = db.get(Attachment, attachment_id)
    if attachment is None or attachment.owner_id != owner_id:
        # Same 404-not-403 reasoning as load_owned_blog: don't confirm that
        # some OTHER user's attachment id exists.
        raise HTTPException(404, "Attachment not found")
    return attachment


def _link_attachment(db: Session, blog_id: UUID, attachment_id: UUID) -> None:
    # A cover is still an attachment the delete-cleanup query in delete_blog
    # has to find, so it needs a blog_attachments row exactly like an inline
    # image does.
    if db.get(BlogAttachment, (blog_id, attachment_id)) is None:
        db.add(BlogAttachment(blog_id=blog_id, attachment_id=attachment_id))


def create_blog(db: Session, profile: Profile, payload: BlogCreate) -> Blog:
    content_html = sanitize_blog_html(payload.content_html)
    blog = Blog(
        author_id=profile.id,
        title=payload.title,
        slug=generate_unique_slug(db, payload.title),
        excerpt=payload.excerpt,
        content_html=content_html,
        content_json=payload.content_json,
        status=payload.status,
        reading_minutes=_estimate_reading_minutes(content_html),
    )

    if payload.cover_attachment_id is not None:
        attachment = _resolve_cover_attachment(db, profile.id, payload.cover_attachment_id)
        blog.cover_attachment_id = attachment.id
        blog.cover_url = attachment.public_url

    if blog.status is BlogStatus.PUBLISHED:
        blog.published_at = datetime.now(timezone.utc)

    db.add(blog)
    db.flush()  # need blog.id before it can be used as a blog_attachments FK

    if payload.cover_attachment_id is not None:
        _link_attachment(db, blog.id, payload.cover_attachment_id)

    db.commit()
    db.refresh(blog)
    return blog


def update_blog(db: Session, blog: Blog, payload: BlogUpdate) -> Blog:
    changes = payload.model_dump(exclude_unset=True)

    if "content_html" in changes:
        changes["content_html"] = sanitize_blog_html(changes["content_html"])
        blog.reading_minutes = _estimate_reading_minutes(changes["content_html"])

    if "cover_attachment_id" in changes:
        attachment_id = changes["cover_attachment_id"]
        if attachment_id is None:
            blog.cover_url = None
        else:
            attachment = _resolve_cover_attachment(db, blog.author_id, attachment_id)
            blog.cover_url = attachment.public_url
            _link_attachment(db, blog.id, attachment_id)

    new_status = changes.get("status")
    for field, value in changes.items():
        setattr(blog, field, value)

    # Only the FIRST publish sets published_at -- an edit made after that,
    # even one that round-trips through draft and back, must not bump it.
    if new_status is BlogStatus.PUBLISHED and blog.published_at is None:
        blog.published_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(blog)
    return blog


def delete_blog(db: Session, profile: Profile, blog: Blog) -> None:
    object_paths = db.scalars(
        select(Attachment.object_path)
        .join(BlogAttachment, BlogAttachment.attachment_id == Attachment.id)
        .where(BlogAttachment.blog_id == blog.id)
    ).all()

    if object_paths:
        supabase = get_supabase_admin()
        # Storage objects must be gone before the row that names them is --
        # the blog_attachments join is the only record of what to delete,
        # and it cascades away with the blog.
        for start in range(0, len(object_paths), 1000):
            supabase.storage.from_(settings.storage_bucket).remove(object_paths[start:start + 1000])

    db.delete(blog)
    db.commit()


def get_blog_for_owner_or_admin(db: Session, blog_id: UUID, profile: Profile) -> Blog:
    return load_owned_blog(blog_id, profile, db)
