from fastapi import FastAPI
from app.models import models
from app.models.base import engine
from fastapi.middleware.cors import CORSMiddleware
from app.api import ai, reports

app = FastAPI(title="KYSAI API", version="0.1.0")

# CORS - Allow ALL for maximum development compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
import os
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.on_event("startup")
async def startup():
    print("KYSAI SYSTEM: Initializing Database...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(models.Base.metadata.create_all)
        print("KYSAI SYSTEM: Database Tables Created/Verified.")
    except Exception as e:
        print(f"KYSAI SYSTEM: Database Initialization Failed: {e}")

app.include_router(ai.router, prefix="/api/v1", tags=["AI"])
app.include_router(reports.router, prefix="/api/v1", tags=["Reports"])

@app.get("/")
def read_root():
    return {"message": "Welcome to KYSAI API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "kysai-backend"}

@app.get("/api/v1/health")
def api_health_check():
    return {"status": "ok", "module": "api-v1", "db": "connected"}
