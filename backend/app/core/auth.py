from typing import Any

import httpx
from fastapi import Depends, Header, HTTPException, status

from app.core.config import get_settings
from app.models.auth import UserProfile
from app.services.complaints import build_profile


def _extract_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization header.")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization header.")
    return token.strip()


def _error_message(payload: dict[str, Any]) -> str:
    return (
        payload.get("msg")
        or payload.get("message")
        or payload.get("error_description")
        or payload.get("error")
        or "Supabase request failed."
    )


def _build_session(payload: dict[str, Any]) -> dict[str, Any] | None:
    session_payload = payload.get("session") if isinstance(payload.get("session"), dict) else payload
    if not session_payload or not session_payload.get("access_token"):
        return None

    return {
        "access_token": session_payload.get("access_token"),
        "refresh_token": session_payload.get("refresh_token"),
        "expires_in": session_payload.get("expires_in"),
        "expires_at": session_payload.get("expires_at"),
        "token_type": session_payload.get("token_type", "bearer"),
    }


async def _request_supabase_auth(
    method: str,
    path: str,
    *,
    payload: dict[str, Any] | None = None,
    token: str | None = None,
) -> dict[str, Any]:
    settings = get_settings()
    headers = {
        "apikey": settings.supabase_anon_key,
        "Content-Type": "application/json",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.request(
            method=method,
            url=f"{settings.supabase_url}/auth/v1{path}",
            json=payload,
            headers=headers,
        )

    data = response.json() if response.content else {}
    if response.is_error:
        raise HTTPException(status_code=response.status_code, detail=_error_message(data))

    return data


async def sign_up_user(full_name: str, email: str, password: str) -> dict[str, Any]:
    return await _request_supabase_auth(
        "POST",
        "/signup",
        payload={
            "email": email,
            "password": password,
            "data": {"full_name": full_name},
        },
    )


async def sign_in_user(email: str, password: str) -> dict[str, Any]:
    return await _request_supabase_auth(
        "POST",
        "/token?grant_type=password",
        payload={
            "email": email,
            "password": password,
        },
    )


async def get_current_user(authorization: str | None = Header(default=None)) -> UserProfile:
    token = _extract_token(authorization)
    auth_user = await _request_supabase_auth("GET", "/user", token=token)
    profile = build_profile(
        user_id=auth_user["id"],
        fallback_email=auth_user.get("email"),
        fallback_name=auth_user.get("user_metadata", {}).get("full_name"),
    )
    return UserProfile(**profile)


async def require_admin(current_user: UserProfile = Depends(get_current_user)) -> UserProfile:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    return current_user


__all__ = [
    "_build_session",
    "get_current_user",
    "require_admin",
    "sign_in_user",
    "sign_up_user",
]
