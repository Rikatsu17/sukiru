from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(String(500), default="")
    credits: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[TaskStatus] = mapped_column(
        SQLEnum(
            TaskStatus,
            values_callable=lambda enum: [item.value for item in enum],
            name="task_status",
        ),
        default=TaskStatus.PENDING,
    )
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    executor_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        default=None,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        default=None,
    )

    owner = relationship(
        "User",
        back_populates="owned_tasks",
        foreign_keys=[owner_id],
    )
    executor = relationship(
        "User",
        back_populates="assigned_tasks",
        foreign_keys=[executor_id],
    )
    applications = relationship("Application", back_populates="task", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="task", cascade="all, delete-orphan")
