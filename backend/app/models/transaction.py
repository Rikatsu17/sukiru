from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, Integer, func
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TransactionStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True)

    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    receiver_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        default=None,
        index=True,
    )
    task_id: Mapped[int] = mapped_column(ForeignKey("tasks.id"), index=True)
    amount: Mapped[int] = mapped_column(Integer)
    status: Mapped[TransactionStatus] = mapped_column(
        SQLEnum(
            TransactionStatus,
            values_callable=lambda enum: [item.value for item in enum],
            name="transaction_status",
        ),
        default=TransactionStatus.PENDING,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    sender = relationship(
        "User",
        back_populates="sent_transactions",
        foreign_keys=[sender_id],
    )
    receiver = relationship(
        "User",
        back_populates="received_transactions",
        foreign_keys=[receiver_id],
    )
    task = relationship("Task", back_populates="transactions")
