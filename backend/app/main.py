from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import applications, auth, tasks, transactions, users
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.PROJECT_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(applications.router)
app.include_router(transactions.router)


@app.get("/")
async def root():
    return {
        "project": "Sukiru",
        "status": "ok",
        "database": settings.DB_NAME,
        "host": settings.DB_HOST,
    }
