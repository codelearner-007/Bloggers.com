import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

# A plain regex rather than pydantic's EmailStr, which needs the extra
# email-validator dependency -- not worth adding for one field.
EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class ContactMessageCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=254, pattern=EMAIL_PATTERN)
    message: str = Field(min_length=1, max_length=5000)


class ContactMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    email: str
    message: str
    is_handled: bool
    created_at: datetime
