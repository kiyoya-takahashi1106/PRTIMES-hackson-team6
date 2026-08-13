from pydantic import BaseModel


class CompanyUpdate(BaseModel):
    name: str | None = None
    name_kana: str | None = None
    short_name: str | None = None
    founded_at: str | None = None
    representative_name: str | None = None
    representative_title: str | None = None
    postal_code: str | None = None
    address: str | None = None
    phone: str | None = None
    market_segment: str | None = None


class PressReleaseCreate(BaseModel):
    title: str
    body: str = ""
    publish: bool = False


class MediaListCreate(BaseModel):
    name: str


class StoryCreate(BaseModel):
    title: str
