from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.transaction import TransactionStatus


class TransactionCreate(BaseModel):
    sender_id: int
    receiver_id: int | None = None
    task_id: int
    amount: int = Field(gt=0)


class TransactionUpdate(BaseModel):
    receiver_id: int | None = None
    status: TransactionStatus


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sender_id: int
    receiver_id: int | None
    task_id: int
    amount: int
    status: TransactionStatus
    created_at: datetime
