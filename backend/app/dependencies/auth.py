from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_supabase_token
from app.models.blog import Blog
from app.models.profile import AppRole, Profile

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_profile(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Profile:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")

    try:
        claims = decode_supabase_token(credentials.credentials)
    except jwt.PyJWTError as error:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token") from error

    profile = db.get(Profile, UUID(claims["sub"]))
    if profile is None:
        # The auth.users trigger provisions the profile. Reaching here means the
        # trigger failed or the profile was deleted out from under the session.
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Profile not provisioned")

    if profile.is_banned:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account suspended")

    return profile


def require_super_admin(
    profile: Profile = Depends(get_current_profile),
) -> Profile:
    # Reads the ROW, not a JWT claim. A demotion takes effect on this request.
    if profile.role is not AppRole.SUPER_ADMIN:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Super admin access required")
    return profile


# Verification establishes identity. It authorizes nothing. Every write
# endpoint that touches someone else's row must additionally check ownership.
def load_owned_blog(blog_id: UUID, profile: Profile, db: Session) -> Blog:
    blog = db.get(Blog, blog_id)
    if blog is None:
        raise HTTPException(404, "Blog not found")
    if blog.author_id != profile.id and profile.role is not AppRole.SUPER_ADMIN:
        raise HTTPException(404, "Blog not found")  # 404, not 403 -- no probing
    return blog
