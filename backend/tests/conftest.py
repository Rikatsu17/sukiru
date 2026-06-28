import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.dependencies import get_db
from app.db.base import Base
from app.main import app


@pytest_asyncio.fixture
async def test_client(tmp_path):
    """Create an AsyncClient with a temporary SQLite test database."""
    database_file = tmp_path / "test.db"
    database_url = f"sqlite+aiosqlite:///{database_file}"

    engine = create_async_engine(
        database_url,
        echo=False,
        connect_args={"check_same_thread": False},
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async_session_maker = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async def _get_test_db():
        async with async_session_maker() as session:
            yield session

    app.dependency_overrides[get_db] = _get_test_db

    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()
    await engine.dispose()
