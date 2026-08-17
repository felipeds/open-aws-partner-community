"""Authentication middleware — JWT validation with optional domain restriction."""
import os
from dataclasses import dataclass

from fastapi import Request, HTTPException
from jose import jwt, JWTError


NEXTAUTH_SECRET = os.getenv("NEXTAUTH_SECRET", "")
ALLOWED_DOMAIN = os.getenv("ALLOWED_DOMAIN", "")
PRIVILEGED_EMAILS = [e.strip() for e in os.getenv("PRIVILEGED_EMAILS", "").split(",") if e.strip()]
APN_ALLOWED_EMAILS = [e.strip() for e in os.getenv("APN_ALLOWED_EMAILS", "").split(",") if e.strip()]


@dataclass
class AuthUser:
    email: str
    is_privileged: bool = False
    can_access_apn: bool = False


async def verify_token(request: Request) -> AuthUser:
    """Verify JWT token from Authorization header. Returns dev user if auth not configured."""
    # Dev mode — no auth required
    if not NEXTAUTH_SECRET:
        return AuthUser(email="dev@localhost", is_privileged=True, can_access_apn=True)

    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization token")

    token = auth_header[7:]  # Strip "Bearer "

    try:
        decoded = jwt.decode(token, NEXTAUTH_SECRET, algorithms=["HS256"])
        email = decoded.get("email", "")

        if not email:
            raise HTTPException(status_code=403, detail="Invalid token: no email")

        if ALLOWED_DOMAIN and not email.endswith(f"@{ALLOWED_DOMAIN}"):
            raise HTTPException(status_code=403, detail="Access restricted to authorized domain")

        return AuthUser(
            email=email,
            is_privileged=email in PRIVILEGED_EMAILS,
            can_access_apn=email in APN_ALLOWED_EMAILS,
        )

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
