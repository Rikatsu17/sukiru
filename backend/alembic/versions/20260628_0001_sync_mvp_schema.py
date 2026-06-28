"""sync mvp schema

Revision ID: 20260628_0001
Revises: 4ff214f595b7
Create Date: 2026-06-28 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260628_0001"
down_revision: Union[str, Sequence[str], None] = "4ff214f595b7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _table_exists(table_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return table_name in inspector.get_table_names()


def _column_exists(table_name: str, column_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return column_name in {
        column["name"] for column in inspector.get_columns(table_name)
    }


def upgrade() -> None:
    if _column_exists("users", "password_hash") and not _column_exists(
        "users",
        "hashed_password",
    ):
        op.alter_column("users", "password_hash", new_column_name="hashed_password")

    if not _column_exists("users", "is_active"):
        op.add_column(
            "users",
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        )
        op.alter_column("users", "is_active", server_default=None)
    if not _column_exists("users", "bio"):
        op.add_column("users", sa.Column("bio", sa.String(length=500), nullable=True))
    if not _column_exists("users", "faculty"):
        op.add_column("users", sa.Column("faculty", sa.String(length=100), nullable=True))
    if not _column_exists("users", "course"):
        op.add_column("users", sa.Column("course", sa.String(length=100), nullable=True))
    if not _column_exists("users", "avatar_url"):
        op.add_column("users", sa.Column("avatar_url", sa.String(length=255), nullable=True))
    if not _column_exists("users", "created_at"):
        op.add_column(
            "users",
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
        )
    if not _column_exists("users", "updated_at"):
        op.add_column(
            "users",
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
        )

    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
                CREATE TYPE task_status AS ENUM (
                    'pending',
                    'in_progress',
                    'completed',
                    'cancelled'
                );
            END IF;
        END
        $$;
    """)
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
                CREATE TYPE application_status AS ENUM (
                    'pending',
                    'accepted',
                    'rejected',
                    'cancelled'
                );
            END IF;
        END
        $$;
    """)
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
                CREATE TYPE transaction_status AS ENUM (
                    'pending',
                    'completed',
                    'cancelled'
                );
            END IF;
        END
        $$;
    """)

    task_status = postgresql.ENUM(
        "pending",
        "in_progress",
        "completed",
        "cancelled",
        name="task_status",
        create_type=False,
    )
    application_status = postgresql.ENUM(
        "pending",
        "accepted",
        "rejected",
        "cancelled",
        name="application_status",
        create_type=False,
    )
    transaction_status = postgresql.ENUM(
        "pending",
        "completed",
        "cancelled",
        name="transaction_status",
        create_type=False,
    )

    if not _table_exists("tasks"):
        op.create_table(
            "tasks",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("title", sa.String(length=100), nullable=False),
            sa.Column("description", sa.String(length=500), nullable=False),
            sa.Column("credits", sa.Integer(), nullable=False),
            sa.Column("status", task_status, nullable=False),
            sa.Column("owner_id", sa.Integer(), nullable=False),
            sa.Column("executor_id", sa.Integer(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
            sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(["executor_id"], ["users.id"]),
            sa.ForeignKeyConstraint(["owner_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
    op.create_index(op.f("ix_tasks_executor_id"), "tasks", ["executor_id"], unique=False, if_not_exists=True)
    op.create_index(op.f("ix_tasks_owner_id"), "tasks", ["owner_id"], unique=False, if_not_exists=True)

    if not _table_exists("applications"):
        op.create_table(
            "applications",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("task_id", sa.Integer(), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("message", sa.String(length=500), nullable=True),
            sa.Column("status", application_status, nullable=False),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
            sa.ForeignKeyConstraint(["task_id"], ["tasks.id"]),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("task_id", "user_id", name="uq_application_task_user"),
        )
    op.create_index(op.f("ix_applications_task_id"), "applications", ["task_id"], unique=False, if_not_exists=True)
    op.create_index(op.f("ix_applications_user_id"), "applications", ["user_id"], unique=False, if_not_exists=True)

    if not _table_exists("transactions"):
        op.create_table(
            "transactions",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("sender_id", sa.Integer(), nullable=False),
            sa.Column("receiver_id", sa.Integer(), nullable=True),
            sa.Column("task_id", sa.Integer(), nullable=False),
            sa.Column("amount", sa.Integer(), nullable=False),
            sa.Column("status", transaction_status, nullable=False),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
            sa.ForeignKeyConstraint(["receiver_id"], ["users.id"]),
            sa.ForeignKeyConstraint(["sender_id"], ["users.id"]),
            sa.ForeignKeyConstraint(["task_id"], ["tasks.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
    op.create_index(op.f("ix_transactions_receiver_id"), "transactions", ["receiver_id"], unique=False, if_not_exists=True)
    op.create_index(op.f("ix_transactions_sender_id"), "transactions", ["sender_id"], unique=False, if_not_exists=True)
    op.create_index(op.f("ix_transactions_task_id"), "transactions", ["task_id"], unique=False, if_not_exists=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_transactions_task_id"), table_name="transactions", if_exists=True)
    op.drop_index(op.f("ix_transactions_sender_id"), table_name="transactions", if_exists=True)
    op.drop_index(op.f("ix_transactions_receiver_id"), table_name="transactions", if_exists=True)
    op.drop_table("transactions", if_exists=True)

    op.drop_index(op.f("ix_applications_user_id"), table_name="applications", if_exists=True)
    op.drop_index(op.f("ix_applications_task_id"), table_name="applications", if_exists=True)
    op.drop_table("applications", if_exists=True)

    op.drop_index(op.f("ix_tasks_owner_id"), table_name="tasks", if_exists=True)
    op.drop_index(op.f("ix_tasks_executor_id"), table_name="tasks", if_exists=True)
    op.drop_table("tasks", if_exists=True)

    op.execute("DROP TYPE IF EXISTS transaction_status")
    op.execute("DROP TYPE IF EXISTS application_status")
    op.execute("DROP TYPE IF EXISTS task_status")

    for column in (
        "updated_at",
        "created_at",
        "avatar_url",
        "course",
        "faculty",
        "bio",
        "is_active",
    ):
        if _column_exists("users", column):
            op.drop_column("users", column)

    if _column_exists("users", "hashed_password") and not _column_exists(
        "users",
        "password_hash",
    ):
        op.alter_column("users", "hashed_password", new_column_name="password_hash")
