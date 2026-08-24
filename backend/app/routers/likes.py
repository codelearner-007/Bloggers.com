from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_profile
from app.models.blog import Blog
from app.models.profile import Profile
from app.services.like_service import like_blog, unlike_blog

router = APIRouter(prefix="/api/v1", tags=["likes"])


@router.post("/blogs/{blog_id}/like")
def like(
    blog_id: UUID,
    profile: Profile = Depends(get_current_profile),
    db: Session = Depends(get_db),
):
    # Liking doesn't require ownership, just that the blog exists -- unlike
    # load_owned_blog, any authenticated user may like any blog.
    if db.get(Blog, blog_id) is None:
        raise HTTPException(404, "Blog not found")
    return {"like_count": like_blog(db, blog_id, profile.id)}


@router.delete("/blogs/{blog_id}/like")
def unlike(
    blog_id: UUID,
    profile: Profile = Depends(get_current_profile),
    db: Session = Depends(get_db),
):
    if db.get(Blog, blog_id) is None:
        raise HTTPException(404, "Blog not found")
    return {"like_count": unlike_blog(db, blog_id, profile.id)}
