from pydantic import BaseModel

from app.models.profile import AppRole


class RoleUpdate(BaseModel):
    role: AppRole


class ContactHandledUpdate(BaseModel):
    is_handled: bool
