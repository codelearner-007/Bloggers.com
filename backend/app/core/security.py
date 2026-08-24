from functools import lru_cache

import jwt
from jwt import PyJWKClient

from app.core.config import settings

SUPABASE_URL = settings.supabase_url.rstrip("/")
JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
EXPECTED_ISSUER = f"{SUPABASE_URL}/auth/v1"
EXPECTED_AUDIENCE = "authenticated"

# Explicit allow-list. Never omit this -- it is what prevents algorithm
# confusion. PyJWT >= 2.13.0 is required: earlier versions carry
# GHSA-jq35-7prp-9v3f, a bypass of exactly this allow-list on the
# PyJWKClient path.
ALLOWED_ALGORITHMS = ["ES256", "RS256"]


@lru_cache(maxsize=1)
def get_jwks_client() -> PyJWKClient:
    """One shared client per process.

    lifespan=300 gives a 5 minute JWKS TTL. That sits inside Supabase's ~20
    minute multi-level cache window (10 min edge + 10 min client) while still
    letting key revocation take effect promptly. Do not cache longer, and do
    not fetch per request.
    """
    return PyJWKClient(JWKS_URL, cache_jwk_set=True, lifespan=300, timeout=10)


def decode_supabase_token(token: str) -> dict:
    signing_key = get_jwks_client().get_signing_key_from_jwt(token)
    return jwt.decode(
        token,
        signing_key,
        algorithms=ALLOWED_ALGORITHMS,
        audience=EXPECTED_AUDIENCE,
        # Without issuer, a token minted by ANY other Supabase project
        # validates against this API.
        issuer=EXPECTED_ISSUER,
        options={"require": ["exp", "iat", "sub", "aud", "iss"]},
    )
