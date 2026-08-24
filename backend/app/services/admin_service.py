from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.blog import Blog
from app.models.contact_message import ContactMessage
from app.models.profile import AppRole, Profile
from app.services import blog_service
from app.utils.supabase_admin import get_supabase_admin


def ban_user(db: Session, admin: Profile, user_id: UUID) -> None:
    if user_id == admin.id:
        raise HTTPException(400, "You cannot ban yourself")
    target = db.get(Profile, user_id)
    if target is None:
        raise HTTPException(404, "User not found")
    target.is_banned = True
    db.commit()
    admin_client = get_supabase_admin()
    admin_client.auth.admin.update_user_by_id(str(user_id), {"ban_duration": "876000h"})
    admin_client.auth.admin.sign_out(str(user_id), "global")


def unban_user(db: Session, admin: Profile, user_id: UUID) -> None:
    target = db.get(Profile, user_id)
    if target is None:
        raise HTTPException(404, "User not found")
    target.is_banned = False
    db.commit()

    admin_client = get_supabase_admin()
    try:
        # "none" is the value supabase_auth's own AdminUserAttributes type
        # documents for lifting a ban.
        admin_client.auth.admin.update_user_by_id(str(user_id), {"ban_duration": "none"})
    except Exception:
        # The Python admin surface is thinner than the JS one and less
        # documented in practice -- if the server rejects "none", an explicit
        # zero-length duration is the other value GoTrue is known to accept,
        # and leaving auth in a rejecting state while the profile row already
        # says unbanned would be worse than trying it.
        admin_client.auth.admin.update_user_by_id(str(user_id), {"ban_duration": "0s"})


def promote_to_super_admin(db: Session, admin: Profile, user_id: UUID) -> None:
    target = db.get(Profile, user_id)
    if target is None:
        raise HTTPException(404, "User not found")
    target.role = AppRole.SUPER_ADMIN
    try:
        db.commit()
    except IntegrityError as error:
        # The partial unique index on profiles allowing only one
        # role='super_admin' row is the actual guarantee here -- this
        # except is a translation of that constraint into an HTTP status,
        # not a substitute for it.
        db.rollback()
        raise HTTPException(409, "There is already a super admin") from error


def demote_user(db: Session, admin: Profile, user_id: UUID) -> None:
    if user_id == admin.id:
        raise HTTPException(400, "You cannot demote yourself")
    target = db.get(Profile, user_id)
    if target is None:
        raise HTTPException(404, "User not found")
    target.role = AppRole.USER
    db.commit()


def delete_blog_as_admin(db: Session, admin: Profile, blog_id: UUID) -> None:
    # Loaded directly by id, not load_owned_blog -- an admin is allowed to
    # delete a blog they don't own, which load_owned_blog would 404 on.
    blog = db.get(Blog, blog_id)
    if blog is None:
        raise HTTPException(404, "Blog not found")
    blog_service.delete_blog(db, admin, blog)


def mark_contact_handled(db: Session, admin: Profile, contact_id: UUID, is_handled: bool) -> ContactMessage:
    contact = db.get(ContactMessage, contact_id)
    if contact is None:
        raise HTTPException(404, "Contact message not found")
    contact.is_handled = is_handled
    db.commit()
    db.refresh(contact)
    return contact
