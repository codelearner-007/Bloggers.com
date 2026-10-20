from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.dependencies.auth import get_current_profile
from app.models.attachment import Attachment, AttachmentKind, AttachmentStatus
from app.models.profile import Profile
from app.schemas.attachment import AttachmentOut, UploadUrlRequest, UploadUrlResponse
from app.utils.supabase_admin import get_supabase_admin

router = APIRouter(prefix="/api/v1/media", tags=["media"])

MAX_BYTES = 5 * 1024 * 1024
EXTENSION_BY_MIME = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/gif": "gif",
}
MAX_PENDING_PER_USER = 20
MAX_ATTACHMENTS_PER_USER = 500


@router.post("/upload-url", status_code=status.HTTP_201_CREATED, response_model=UploadUrlResponse)
def create_upload_url(
    payload: UploadUrlRequest,
    profile: Profile = Depends(get_current_profile),
    db: Session = Depends(get_db),
):
    # The bucket's allowed_mime_types is checked against the CLIENT-DECLARED
    # Content-Type and nothing sniffs magic bytes -- so THIS is the check
    # that counts, and /commit re-reads the real size from the server.
    extension = EXTENSION_BY_MIME.get(payload.mime_type)
    if extension is None:
        raise HTTPException(422, "Unsupported image type")
    if payload.size_bytes > MAX_BYTES:
        raise HTTPException(422, "Image must be 5 MB or smaller")

    # Cheap abuse guard: without this, any Google account can fill the whole
    # free-tier storage quota.
    pending_count, total_count = db.execute(
        select(
            func.count().filter(Attachment.status == AttachmentStatus.PENDING),
            func.count(),
        ).select_from(Attachment).where(Attachment.owner_id == profile.id)
    ).one()
    if pending_count >= MAX_PENDING_PER_USER or total_count >= MAX_ATTACHMENTS_PER_USER:
        raise HTTPException(429, "Upload quota reached")

    # WE choose the key. Never the client filename: Supabase rejects
    # non-ASCII, '#', '%', '[', ']', '{', '}' and backslash outright, and a
    # client-supplied path could target someone else's folder.
    object_path = f"{profile.id}/{uuid4().hex}.{extension}"

    bucket = settings.storage_bucket
    supabase = get_supabase_admin()
    signed = supabase.storage.from_(bucket).create_signed_upload_url(object_path)
    public_url = supabase.storage.from_(bucket).get_public_url(object_path)

    attachment = Attachment(
        owner_id=profile.id,
        bucket=bucket,
        object_path=object_path,
        public_url=public_url,
        mime_type=payload.mime_type,
        size_bytes=payload.size_bytes,
        original_file_name=payload.file_name[:255],
        kind=payload.kind,
        status=AttachmentStatus.PENDING,
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    return UploadUrlResponse(
        attachment_id=attachment.id,
        signed_url=signed["signed_url"],
        object_path=object_path,
        public_url=public_url,
    )


@router.post("/{attachment_id}/commit", response_model=AttachmentOut)
def commit_upload(
    attachment_id: UUID,
    profile: Profile = Depends(get_current_profile),
    db: Session = Depends(get_db),
):
    attachment = db.get(Attachment, attachment_id)
    if attachment is None or attachment.owner_id != profile.id:
        raise HTTPException(404, "Attachment not found")

    bucket = settings.storage_bucket
    supabase = get_supabase_admin()
    folder, file_name = attachment.object_path.rsplit("/", 1)
    listing = supabase.storage.from_(bucket).list(folder)
    matched = next((item for item in listing if item.get("name") == file_name), None)
    if matched is None:
        raise HTTPException(409, "Object was never uploaded")

    real_size = (matched.get("metadata") or {}).get("size")
    if real_size is not None:
        if real_size > MAX_BYTES:
            supabase.storage.from_(bucket).remove([attachment.object_path])
            db.delete(attachment)
            db.commit()
            raise HTTPException(422, "Uploaded file exceeds the size limit")
        attachment.size_bytes = real_size

    attachment.status = AttachmentStatus.COMMITTED
    db.commit()
    db.refresh(attachment)
    return attachment
