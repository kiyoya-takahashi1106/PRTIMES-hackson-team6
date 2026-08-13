import random
import string
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from db import Base

BREAKDOWN_LABELS = ["テレビ", "雑誌", "新聞", "Web", "フリーペーパー", "ラジオ", "通信社"]


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def empty_breakdown() -> list[dict]:
    return [{"label": label, "value": 0} for label in BREAKDOWN_LABELS]


def random_story_id() -> str:
    return "".join(random.choices(string.ascii_letters + string.digits, k=11))


class Company(Base):
    """Single-row demo company profile, matching the account's own PR TIMES profile."""

    __tablename__ = "companies"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    name_kana: Mapped[str] = mapped_column(String(255))
    short_name: Mapped[str] = mapped_column(String(255))
    founded_at: Mapped[str] = mapped_column(String(64))
    representative_name: Mapped[str] = mapped_column(String(255))
    representative_title: Mapped[str] = mapped_column(String(255))
    postal_code: Mapped[str] = mapped_column(String(16))
    address: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str] = mapped_column(String(32))
    market_segment: Mapped[str] = mapped_column(String(64))


class PressRelease(Base):
    __tablename__ = "press_releases"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255))
    body: Mapped[str] = mapped_column(String, default="")
    status: Mapped[str] = mapped_column(String(16), default="下書き")
    url: Mapped[str] = mapped_column(String(500), default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    @property
    def public_id(self) -> str:
        # Mimics PR TIMES-style zero-padded release numbers (e.g. "000000024").
        return f"{self.id:09d}"


class MediaList(Base):
    __tablename__ = "media_lists"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    count: Mapped[int] = mapped_column(Integer, default=0)
    breakdown: Mapped[list] = mapped_column(JSON, default=empty_breakdown)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    @property
    def public_id(self) -> str:
        return f"list-{self.id}"


class Story(Base):
    __tablename__ = "stories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    public_id: Mapped[str] = mapped_column(String(32), unique=True, index=True, default=random_story_id)
    title: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(16), default="下書き")
    url: Mapped[str] = mapped_column(String(500), default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)
