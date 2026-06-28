from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transaction import Transaction, TransactionStatus
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionUpdate


async def get_transaction(
    db: AsyncSession,
    transaction_id: int,
) -> Transaction | None:
    result = await db.execute(
        select(Transaction).where(Transaction.id == transaction_id)
    )
    return result.scalar_one_or_none()


async def get_task_transaction(
    db: AsyncSession,
    task_id: int,
) -> Transaction | None:
    result = await db.execute(
        select(Transaction).where(Transaction.task_id == task_id)
    )
    return result.scalar_one_or_none()


async def get_user_transactions(
    db: AsyncSession,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
) -> list[Transaction]:
    result = await db.execute(
        select(Transaction)
        .where(
            (Transaction.sender_id == user_id)
            | (Transaction.receiver_id == user_id)
        )
        .order_by(Transaction.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(result.scalars().all())


async def create_transaction(
    db: AsyncSession,
    transaction_in: TransactionCreate,
) -> Transaction:
    transaction = Transaction(**transaction_in.model_dump())
    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)
    return transaction


async def update_transaction(
    db: AsyncSession,
    transaction: Transaction,
    transaction_in: TransactionUpdate,
) -> Transaction:
    update_data = transaction_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(transaction, field, value)

    await db.commit()
    await db.refresh(transaction)
    return transaction


async def complete_transaction(
    db: AsyncSession,
    transaction: Transaction,
    receiver: User,
) -> Transaction:
    if transaction.status != TransactionStatus.PENDING:
        raise ValueError("Transaction is not pending")

    transaction.receiver_id = receiver.id
    transaction.status = TransactionStatus.COMPLETED
    receiver.credits += transaction.amount

    await db.commit()
    await db.refresh(transaction)
    return transaction


async def cancel_transaction(
    db: AsyncSession,
    transaction: Transaction,
) -> Transaction:
    if transaction.status != TransactionStatus.PENDING:
        raise ValueError("Transaction is not pending")

    sender = await db.get(User, transaction.sender_id)
    if sender is not None:
        sender.credits += transaction.amount
    transaction.status = TransactionStatus.CANCELLED

    await db.commit()
    await db.refresh(transaction)
    return transaction


async def delete_transaction(db: AsyncSession, transaction: Transaction) -> None:
    await db.delete(transaction)
    await db.commit()
