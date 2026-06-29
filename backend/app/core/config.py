from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Sukiru"
    PROJECT_DESCRIPTION: str = (
        "Sukiru is a P2P skill exchange platform for students"
    )
    PROJECT_VERSION: str = "1.0.0"

    # Allow sensible defaults and optional DATABASE_URL override
    DATABASE_URL: str | None = None

    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:15432",
        "http://127.0.0.1:15432",        "http://localhost:3000",
        "http://127.0.0.1:3000",    ]

    model_config = SettingsConfigDict(
        env_file=("backend/.env", ".env"),
        extra="ignore",
    )

    @property
    def database_url(self) -> str:
        # Allow explicit DATABASE_URL env var to override composed parts
        if self.DATABASE_URL:
            return self.DATABASE_URL

        return (
            "postgresql+asyncpg://"
            f"{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/"
            f"{self.DB_NAME}"
        )


settings = Settings()
