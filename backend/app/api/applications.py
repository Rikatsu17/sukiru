from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user, get_db
from app.crud.application import (
    accept_application,
    cancel_application,
    create_application,
    get_application,
    get_task_applications,
    get_user_applications,
    get_user_task_application,
)
from app.crud.task import get_task
from app.models.application import ApplicationStatus
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationResponse


router = APIRouter(prefix="/applications", tags=["applications"])


@router.post(
    "",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_new_application(
    application_in: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    task = await get_task(db, application_in.task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    if task.owner_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task owner cannot apply to own task",
        )

    existing_application = await get_user_task_application(
        db,
        task_id=application_in.task_id,
        user_id=current_user.id,
    )
    if existing_application is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already applied to this task",
        )

    return await create_application(db, application_in, current_user.id)


@router.get("/my", response_model=list[ApplicationResponse])
async def read_my_applications(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return await get_user_applications(
        db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
    )


@router.get("/task/{task_id}", response_model=list[ApplicationResponse])
async def read_task_applications(
    task_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    task = await get_task(db, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    if task.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only task owner can view task applications",
        )

    return await get_task_applications(
        db,
        task_id=task_id,
        skip=skip,
        limit=limit,
    )


@router.post("/{application_id}/accept", response_model=ApplicationResponse)
async def accept_existing_application(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    application = await get_application(db, application_id)
    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    task = await get_task(db, application.task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    if task.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only task owner can accept applications",
        )

    try:
        return await accept_application(db, application)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.post("/{application_id}/cancel", response_model=ApplicationResponse)
async def cancel_existing_application(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    application = await get_application(db, application_id)
    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )
    if application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only application author can cancel it",
        )
    if application.status != ApplicationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending application can be cancelled",
        )

    return await cancel_application(db, application)
