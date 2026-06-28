from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user, get_db
from app.crud.transaction import (
    get_task_transaction,
    get_transaction,
    get_user_transactions,
)
from app.models.user import User
from app.schemas.transaction import TransactionResponse


router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/my", response_model=list[TransactionResponse])
async def read_my_transactions(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return await get_user_transactions(
        db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
    )


@router.get("/task/{task_id}", response_model=TransactionResponse)
async def read_task_transaction(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    transaction = await get_task_transaction(db, task_id)
    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )
    if (
        transaction.sender_id != current_user.id
        and transaction.receiver_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot view this transaction",
        )

    return transaction


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def read_transaction(
    transaction_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    transaction = await get_transaction(db, transaction_id)
    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )
    if (
        transaction.sender_id != current_user.id
        and transaction.receiver_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot view this transaction",
        )

    return transaction
