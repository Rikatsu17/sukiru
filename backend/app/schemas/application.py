from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.application import ApplicationStatus


class ApplicationBase(BaseModel):
    message: str | None = Field(default="", max_length=500)


class ApplicationCreate(ApplicationBase):
    task_id: int


class ApplicationUpdate(BaseModel):
    status: ApplicationStatus


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: int
    user_id: int
    message: str | None
    status: ApplicationStatus
    created_at: datetime
