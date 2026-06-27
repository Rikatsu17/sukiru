from fastapi import FastAPI
from app.core.config import settings

app = FastAPI(
    title = "Sukiru",
    description = "Sukiru is a p2p skill exchange platform that allows users to exchange skills and knowledge",
    version = "1.0.0",
)
@app.get("/")
async def root():
    return {
        "project": "Sukiru",
        "database": settings.DB_NAME,
        "host": settings.DB_HOST
    }