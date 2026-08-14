from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    name_kana: Optional[str] = None
    short_name: Optional[str] = None
    founded_at: Optional[str] = None
    representative_name: Optional[str] = None
    representative_title: Optional[str] = None
    postal_code: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    market_segment: Optional[str] = None


class PressReleaseCreate(BaseModel):
    title: str
    body: str = ""
    publish: bool = False


class MediaListCreate(BaseModel):
    name: str


class MediaRecommendationRequest(BaseModel):
    title: str = ""
    lead_paragraph: str = ""
    body: str = ""


class StoryCreate(BaseModel):
    title: str
