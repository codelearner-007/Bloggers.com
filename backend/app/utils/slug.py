import uuid

from slugify import slugify
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.blog import Blog


def generate_unique_slug(db: Session, title: str) -> str:
    """blogs.slug has a `unique` constraint (case-insensitive, via
    blogs_slug_lower_idx) -- this just avoids round-tripping a 23505 back
    into a 500 on the happy path. A genuine race is still handled by that
    constraint, not by this loop."""
    base = slugify(title)[:180] or "post"
    candidate = base
    suffix = 1

    while db.scalar(select(Blog.id).where(Blog.slug == candidate)) is not None:
        suffix += 1
        candidate = f"{base}-{suffix}"
        if suffix > 50:
            candidate = f"{base}-{uuid.uuid4().hex[:8]}"
            break

    return candidate
