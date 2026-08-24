from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_profile, load_owned_blog
from app.models.profile import Profile
from app.schemas.blog import BlogCreate, BlogListItemOut, BlogOut, BlogUpdate
from app.schemas.pagination import Page
from app.services.blog_service import create_blog, delete_blog, list_blogs_for_author, update_blog

router = APIRouter(prefix="/api/v1", tags=["blogs"])


@router.get("/me/blogs", response_model=Page[BlogListItemOut])
def list_my_blogs(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100, alias="pageSize")] = 12,
    search: Annotated[str | None, Query(max_length=200)] = None,
    profile: Profile = Depends(get_current_profile),
    db: Session = Depends(get_db),
):
    # Any status -- this is the author's own dashboard, not the public list,
    # so drafts and archived posts belong here too.
    result = list_blogs_for_author(db, profile.id, page=page, page_size=page_size, search=search)
    return result


@router.get("/blogs/{blog_id}", response_model=BlogOut)
def get_blog(
    blog_id: UUID,
    profile: Profile = Depends(get_current_profile),
    db: Session = Depends(get_db),
):
    return load_owned_blog(blog_id, profile, db)


@router.post("/blogs", status_code=status.HTTP_201_CREATED, response_model=BlogOut)
def create_new_blog(
    payload: BlogCreate,
    profile: Profile = Depends(get_current_profile),
    db: Session = Depends(get_db),
):
    return create_blog(db, profile, payload)


@router.patch("/blogs/{blog_id}", response_model=BlogOut)
def patch_blog(
    blog_id: UUID,
    payload: BlogUpdate,
    profile: Profile = Depends(get_current_profile),
    db: Session = Depends(get_db),
):
    blog = load_owned_blog(blog_id, profile, db)
    return update_blog(db, blog, payload)


@router.delete("/blogs/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_blog(
    blog_id: UUID,
    profile: Profile = Depends(get_current_profile),
    db: Session = Depends(get_db),
):
    blog = load_owned_blog(blog_id, profile, db)
    delete_blog(db, profile, blog)
