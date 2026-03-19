from fastapi import APIRouter, Depends, status

from app.core.auth import _build_session, get_current_user, sign_in_user, sign_up_user
from app.models.auth import AuthResponse, SessionTokens, SignInRequest, SignUpRequest, UserProfile
from app.services.complaints import build_profile

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/sign-up", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def sign_up(payload: SignUpRequest) -> AuthResponse:
    response = await sign_up_user(payload.full_name, payload.email, payload.password)
    user = response.get("user") or {}
    profile = None

    if user.get("id"):
        profile = UserProfile(
            **build_profile(
                user_id=user["id"],
                fallback_email=user.get("email") or payload.email,
                fallback_name=user.get("user_metadata", {}).get("full_name") or payload.full_name,
            )
        )

    session = _build_session(response)
    message = (
        "Account created. A verification email may be required before sign in."
        if session is None
        else "Account created and signed in."
    )

    return AuthResponse(
        message=message,
        profile=profile,
        session=SessionTokens(**session) if session else None,
    )


@router.post("/sign-in", response_model=AuthResponse)
async def sign_in(payload: SignInRequest) -> AuthResponse:
    response = await sign_in_user(payload.email, payload.password)
    user = response.get("user") or {}
    profile = UserProfile(
        **build_profile(
            user_id=user["id"],
            fallback_email=user.get("email") or payload.email,
            fallback_name=user.get("user_metadata", {}).get("full_name"),
        )
    )
    session = _build_session(response)

    return AuthResponse(
        message="Signed in successfully.",
        profile=profile,
        session=SessionTokens(**session) if session else None,
    )


@router.get("/me", response_model=UserProfile)
async def get_me(current_user: UserProfile = Depends(get_current_user)) -> UserProfile:
    return current_user
