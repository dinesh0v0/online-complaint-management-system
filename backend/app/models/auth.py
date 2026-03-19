from pydantic import BaseModel, EmailStr, Field, field_validator


class UserProfile(BaseModel):
    id: str
    email: EmailStr | str
    full_name: str
    role: str


class SessionTokens(BaseModel):
    access_token: str | None = None
    refresh_token: str | None = None
    expires_in: int | None = None
    expires_at: int | None = None
    token_type: str | None = None


class AuthResponse(BaseModel):
    message: str
    profile: UserProfile | None = None
    session: SessionTokens | None = None


class SignUpRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("full_name")
    @classmethod
    def normalize_full_name(cls, value: str) -> str:
        return value.strip()


class SignInRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
