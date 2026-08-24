import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.attachment import AttachmentKind, AttachmentStatus


class UploadUrlRequest(BaseModel):
    kind: AttachmentKind
    file_name: str = Field(max_length=255)
    mime_type: str
    size_bytes: int = Field(gt=0)


class UploadUrlResponse(BaseModel):
    attachment_id: uuid.UUID
    signed_url: str
    object_path: str
    public_url: str


class AttachmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    object_path: str
    public_url: str
    mime_type: str
    size_bytes: int | None
    kind: AttachmentKind
    status: AttachmentStatus
    created_at: datetime
