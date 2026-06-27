from datetime import datetime
from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)

    full_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column("hashed_password", String(255))

    credits: Mapped[int] = mapped_column(Integer, default=10)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    bio: Mapped[str | None] = mapped_column(String(500), default=None)
    faculty: Mapped[str | None] = mapped_column(String(100), default="")
    course: Mapped[str | None] = mapped_column(String(100), default="")
    avatar_url: Mapped[str | None] = mapped_column(String(255), nullable=True, default=None)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    owned_tasks = relationship(
        "Task",
        back_populates="owner",
        foreign_keys="Task.owner_id",
    )
    assigned_tasks = relationship(
        "Task",
        back_populates="executor",
        foreign_keys="Task.executor_id",
    )
    applications = relationship("Application", back_populates="user")
    sent_transactions = relationship(
        "Transaction",
        back_populates="sender",
        foreign_keys="Transaction.sender_id",
    )
    received_transactions = relationship(
        "Transaction",
        back_populates="receiver",
        foreign_keys="Transaction.receiver_id",
    )
