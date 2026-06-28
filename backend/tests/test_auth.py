import pytest
from app.main import app


@pytest.mark.asyncio
async def test_register_user(test_client):
    """Test user registration."""
    response = await test_client.post(
        "/auth/register",
        json={
            "full_name": "Test User",
            "email": "test@example.com",
            "password": "testpassword123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"
    assert "password" not in data


@pytest.mark.asyncio
async def test_login_user(test_client):
    """Test user login."""
    await test_client.post(
        "/auth/register",
        json={
            "full_name": "Test User",
            "email": "test@example.com",
            "password": "testpassword123",
        },
    )

    response = await test_client.post(
        "/auth/login/json",
        json={
            "email": "test@example.com",
            "password": "testpassword123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
