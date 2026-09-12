from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings
from sqlalchemy.orm import Session
from sqlalchemy import inspect, text
import os
from dotenv import load_dotenv

from data.database import engine, Base, SessionLocal
from data import models
from routers import tickets, analytics

load_dotenv()

class Settings(BaseSettings):
    app_name: str = "Datastraw Support CRM"
    debug: bool = True
    database_url: str = "sqlite:///./data/datastraw_crm.db"
    groq_api_key: str = ""
    groq_model: str = "groq/compound-mini"

settings = Settings()

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    _migrate_existing_db()


def _migrate_existing_db():
    try:
        with engine.connect() as conn:
            inspector = inspect(engine)
            if "tickets" in inspector.get_table_names():
                columns = [col["name"] for col in inspector.get_columns("tickets")]
                if "priority" not in columns:
                    conn.execute(text("ALTER TABLE tickets ADD COLUMN priority VARCHAR(20) NOT NULL DEFAULT 'Medium'"))
                    conn.commit()
    except Exception:
        pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.app_name}"}

app.include_router(tickets.router)
app.include_router(analytics.router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
