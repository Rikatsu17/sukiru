from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.task import TaskStatus


class TaskBase(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    description: str = Field(default="", max_length=500)
    credits: int = Field(gt=0)


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    credits: int | None = Field(default=None, gt=0)
    status: TaskStatus | None = None
    executor_id: int | None = None


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    credits: int
    status: TaskStatus
    owner_id: int
    executor_id: int | None
    created_at: datetime
    completed_at: datetime | None
