from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    line_user_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    internal_account_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    linked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )


class Article(Base):
    """Demo dataset of PR TIMES-style articles, browsable by category."""

    __tablename__ = "articles"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(32), index=True)
    company_name: Mapped[str] = mapped_column(String(255))
    url: Mapped[str] = mapped_column(String(500))


class OwnReleaseView(Base):
    """Demo view-count stats for the logged-in company's own releases."""

    __tablename__ = "own_release_views"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    url: Mapped[str] = mapped_column(String(500))
    weekly_views: Mapped[int] = mapped_column(Integer)
    monthly_views: Mapped[int] = mapped_column(Integer)
