from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application, ApplicationStatus
from app.models.task import Task, TaskStatus
from app.schemas.application import ApplicationCreate, ApplicationUpdate


async def get_application(
    db: AsyncSession,
    application_id: int,
) -> Application | None:
    result = await db.execute(
        select(Application).where(Application.id == application_id)
    )
    return result.scalar_one_or_none()


async def get_task_applications(
    db: AsyncSession,
    task_id: int,
    skip: int = 0,
    limit: int = 100,
) -> list[Application]:
    result = await db.execute(
        select(Application)
        .where(Application.task_id == task_id)
        .order_by(Application.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_user_applications(
    db: AsyncSession,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
) -> list[Application]:
    result = await db.execute(
        select(Application)
        .where(Application.user_id == user_id)
        .order_by(Application.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_user_task_application(
    db: AsyncSession,
    task_id: int,
    user_id: int,
) -> Application | None:
    result = await db.execute(
        select(Application).where(
            Application.task_id == task_id,
            Application.user_id == user_id,
        )
    )
    return result.scalar_one_or_none()


async def create_application(
    db: AsyncSession,
    application_in: ApplicationCreate,
    user_id: int,
) -> Application:
    application = Application(
        task_id=application_in.task_id,
        user_id=user_id,
        message=application_in.message,
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)
    return application


async def update_application(
    db: AsyncSession,
    application: Application,
    application_in: ApplicationUpdate,
) -> Application:
    application.status = application_in.status
    await db.commit()
    await db.refresh(application)
    return application


async def accept_application(
    db: AsyncSession,
    application: Application,
) -> Application:
    task = await db.get(Task, application.task_id)
    if task is None:
        raise ValueError("Task not found")
    if task.status != TaskStatus.PENDING:
        raise ValueError("Task is not open")

    application.status = ApplicationStatus.ACCEPTED
    task.executor_id = application.user_id
    task.status = TaskStatus.IN_PROGRESS

    result = await db.execute(
        select(Application).where(
            Application.task_id == application.task_id,
            Application.id != application.id,
            Application.status == ApplicationStatus.PENDING,
        )
    )
    for other_application in result.scalars().all():
        other_application.status = ApplicationStatus.REJECTED

    await db.commit()
    await db.refresh(application)
    return application


async def cancel_application(
    db: AsyncSession,
    application: Application,
) -> Application:
    application.status = ApplicationStatus.CANCELLED
    await db.commit()
    await db.refresh(application)
    return application


async def delete_application(db: AsyncSession, application: Application) -> None:
    await db.delete(application)
    await db.commit()
