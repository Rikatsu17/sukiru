from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task, TaskStatus
from app.models.transaction import Transaction, TransactionStatus
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate


async def get_task(db: AsyncSession, task_id: int) -> Task | None:
    result = await db.execute(select(Task).where(Task.id == task_id))
    return result.scalar_one_or_none()


async def get_tasks(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
) -> list[Task]:
    result = await db.execute(
        select(Task)
        .order_by(Task.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_open_tasks(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
) -> list[Task]:
    result = await db.execute(
        select(Task)
        .where(Task.status == TaskStatus.PENDING)
        .order_by(Task.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_user_tasks(
    db: AsyncSession,
    owner_id: int,
    skip: int = 0,
    limit: int = 100,
) -> list[Task]:
    result = await db.execute(
        select(Task)
        .where(Task.owner_id == owner_id)
        .order_by(Task.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(result.scalars().all())


async def create_task(
    db: AsyncSession,
    task_in: TaskCreate,
    owner: User,
) -> Task:
    if owner.credits < task_in.credits:
        raise ValueError("Not enough credits")

    owner.credits -= task_in.credits
    task = Task(
        title=task_in.title,
        description=task_in.description,
        credits=task_in.credits,
        owner_id=owner.id,
    )
    db.add(task)
    await db.flush()

    escrow = Transaction(
        sender_id=owner.id,
        receiver_id=None,
        task_id=task.id,
        amount=task.credits,
        status=TransactionStatus.PENDING,
    )
    db.add(escrow)

    await db.commit()
    await db.refresh(task)
    return task


async def update_task(
    db: AsyncSession,
    task: Task,
    task_in: TaskUpdate,
) -> Task:
    update_data = task_in.model_dump(exclude_unset=True)
    new_credits = update_data.pop("credits", None)

    if new_credits is not None and new_credits != task.credits:
        if task.status != TaskStatus.PENDING:
            raise ValueError("Credits can be changed only for pending tasks")

        result = await db.execute(
            select(Transaction).where(
                Transaction.task_id == task.id,
                Transaction.status == TransactionStatus.PENDING,
            )
        )
        escrow = result.scalar_one_or_none()
        if escrow is None:
            raise ValueError("Pending escrow transaction not found")

        owner = await db.get(User, task.owner_id)
        if owner is None:
            raise ValueError("Task owner not found")

        credits_delta = new_credits - task.credits
        if credits_delta > 0 and owner.credits < credits_delta:
            raise ValueError("Not enough credits")

        owner.credits -= credits_delta
        escrow.amount = new_credits
        task.credits = new_credits

    for field, value in update_data.items():
        setattr(task, field, value)

    if task.status == TaskStatus.COMPLETED and task.completed_at is None:
        task.completed_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(task)
    return task


async def assign_executor(
    db: AsyncSession,
    task: Task,
    executor_id: int,
) -> Task:
    task.executor_id = executor_id
    task.status = TaskStatus.IN_PROGRESS
    await db.commit()
    await db.refresh(task)
    return task


async def complete_task(db: AsyncSession, task: Task) -> Task:
    if task.executor_id is None:
        raise ValueError("Task has no executor")

    result = await db.execute(
        select(Transaction).where(
            Transaction.task_id == task.id,
            Transaction.status == TransactionStatus.PENDING,
        )
    )
    escrow = result.scalar_one_or_none()
    if escrow is None:
        raise ValueError("Pending escrow transaction not found")

    executor = await db.get(User, task.executor_id)
    if executor is None:
        raise ValueError("Executor not found")

    escrow.receiver_id = executor.id
    escrow.status = TransactionStatus.COMPLETED
    executor.credits += escrow.amount
    task.status = TaskStatus.COMPLETED
    task.completed_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(task)
    return task


async def cancel_task(db: AsyncSession, task: Task) -> Task:
    result = await db.execute(
        select(Transaction).where(
            Transaction.task_id == task.id,
            Transaction.status == TransactionStatus.PENDING,
        )
    )
    escrow = result.scalar_one_or_none()
    if escrow is not None:
        owner = await db.get(User, escrow.sender_id)
        if owner is not None:
            owner.credits += escrow.amount
        escrow.status = TransactionStatus.CANCELLED

    task.status = TaskStatus.CANCELLED

    await db.commit()
    await db.refresh(task)
    return task


async def delete_task(db: AsyncSession, task: Task) -> None:
    await db.delete(task)
    await db.commit()
