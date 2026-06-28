from datetime import datetime

from pydantic import AnyHttpUrl, BaseModel, ConfigDict, Field


EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class UserBase(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: str = Field(max_length=255, pattern=EMAIL_PATTERN)
    bio: str | None = Field(default="", max_length=500)
    faculty: str | None = Field(default="", max_length=100)
    course: str | None = Field(default="", max_length=100)
    avatar_url: AnyHttpUrl | None = None

class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: str = Field(max_length=255, pattern=EMAIL_PATTERN)
    password: str = Field(min_length=8, max_length=128)


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=100)
    bio: str | None = Field(default=None, max_length=500)
    faculty: str | None = Field(default=None, max_length=100)
    course: str | None = Field(default=None, max_length=100)
    avatar_url: AnyHttpUrl | None = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    credits: int
    bio: str | None
    faculty: str | None
    course: str | None
    avatar_url: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime
