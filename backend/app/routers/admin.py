from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_super_admin
from app.models.profile import AppRole, Profile
from app.schemas.admin import ContactHandledUpdate, RoleUpdate
from app.schemas.contact import ContactMessageOut
from app.services import admin_service

# Every route below still takes its own Depends(require_super_admin) to get
# the admin Profile row (self-ban/self-demote checks need it) -- FastAPI
# caches a dependency per request, so this doesn't run the check twice; the
# router-level dependency above is what actually gates access if a route
# were ever added here without that parameter.
router = APIRouter(
    prefix="/api/v1/admin",
    tags=["admin"],
    dependencies=[Depends(require_super_admin)],
)


@router.patch("/users/{user_id}/role", status_code=status.HTTP_204_NO_CONTENT)
def update_user_role(
    user_id: UUID,
    payload: RoleUpdate,
    admin: Profile = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    if payload.role is AppRole.SUPER_ADMIN:
        admin_service.promote_to_super_admin(db, admin, user_id)
    else:
        admin_service.demote_user(db, admin, user_id)


@router.post("/users/{user_id}/ban", status_code=status.HTTP_204_NO_CONTENT)
def ban_user(
    user_id: UUID,
    admin: Profile = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    admin_service.ban_user(db, admin, user_id)


@router.delete("/users/{user_id}/ban", status_code=status.HTTP_204_NO_CONTENT)
def unban_user(
    user_id: UUID,
    admin: Profile = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    admin_service.unban_user(db, admin, user_id)


@router.delete("/blogs/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blog(
    blog_id: UUID,
    admin: Profile = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    admin_service.delete_blog_as_admin(db, admin, blog_id)


@router.patch("/contact/{contact_id}", response_model=ContactMessageOut)
def update_contact_handled(
    contact_id: UUID,
    payload: ContactHandledUpdate,
    admin: Profile = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    return admin_service.mark_contact_handled(db, admin, contact_id, payload.is_handled)
