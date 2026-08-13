import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

BASE_DIR = Path(__file__).parent
load_dotenv(BASE_DIR.parent / ".env")

DB_HOST = os.environ.get(
    "DB_HOST", "prtimes-hackathon-2026summer-db.cfq2m2o6cvor.ap-northeast-1.rds.amazonaws.com"
)
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_NAME = os.environ.get("DB_NAME", "prtimes")
DB_USER = os.environ.get("DB_USER", "hackathon")
DB_PASSWORD = os.environ.get("DB_PASSWORD")

if os.environ.get("DATABASE_URL"):
    DATABASE_URL = os.environ["DATABASE_URL"]
elif DB_PASSWORD:
    DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
else:
    # No RDS credentials configured (e.g. DB_PASSWORD/.env missing): fall back to a local
    # SQLite file so the API still runs for local development/testing.
    DATABASE_URL = f"sqlite:///{BASE_DIR / 'guide_panel.db'}"

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


def init_db() -> None:
    from models import Company, MediaList, PressRelease, Story  # noqa: F401 (registers tables)

    Base.metadata.create_all(engine)


def get_session() -> Session:
    return SessionLocal()
