import uuid

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.models.blog import Blog
from app.models.blog_like import BlogLike


def like_blog(db: Session, blog_id: uuid.UUID, user_id: uuid.UUID) -> int:
    # ON CONFLICT DO NOTHING rather than a SELECT-then-INSERT: makes a
    # double-click race safe without a round trip, and keeps this idempotent
    # for a caller that retries after a dropped response.
    stmt = insert(BlogLike).values(blog_id=blog_id, user_id=user_id)
    stmt = stmt.on_conflict_do_nothing(index_elements=["blog_id", "user_id"])
    db.execute(stmt)
    db.commit()
    return _current_like_count(db, blog_id)


def unlike_blog(db: Session, blog_id: uuid.UUID, user_id: uuid.UUID) -> int:
    db.execute(
        BlogLike.__table__.delete().where(
            BlogLike.blog_id == blog_id, BlogLike.user_id == user_id
        )
    )
    db.commit()
    return _current_like_count(db, blog_id)


def _current_like_count(db: Session, blog_id: uuid.UUID) -> int:
    # Re-select rather than trust an in-memory value -- the counter is
    # maintained by a DB trigger, so this row is the only source of truth.
    return db.scalar(select(Blog.like_count).where(Blog.id == blog_id))
