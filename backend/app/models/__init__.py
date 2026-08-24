"""Importing this package registers every mapped class on the shared
declarative Base before any relationship() string reference needs resolving.
main.py imports this package first, before any router, for exactly that
reason."""

from app.models.attachment import Attachment, AttachmentKind, AttachmentStatus, BlogAttachment
from app.models.blog import Blog, BlogStatus
from app.models.blog_like import BlogLike
from app.models.contact_message import ContactMessage
from app.models.profile import AppRole, Profile

__all__ = [
    "Attachment",
    "AttachmentKind",
    "AttachmentStatus",
    "BlogAttachment",
    "Blog",
    "BlogStatus",
    "BlogLike",
    "ContactMessage",
    "AppRole",
    "Profile",
]
