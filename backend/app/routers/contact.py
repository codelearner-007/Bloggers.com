from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.contact_message import ContactMessage
from app.schemas.contact import ContactMessageCreate, ContactMessageOut

router = APIRouter(prefix="/api/v1", tags=["contact"])


@router.post("/contact", status_code=status.HTTP_201_CREATED, response_model=ContactMessageOut)
def submit_contact_message(
    payload: ContactMessageCreate,
    db: Session = Depends(get_db),
):
    # Public endpoint, no auth dependency -- submitted_by stays null for an
    # anonymous visitor and is never inferred from a token that isn't there.
    message = ContactMessage(name=payload.name, email=payload.email, message=payload.message)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
