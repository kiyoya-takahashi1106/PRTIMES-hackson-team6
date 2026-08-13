from typing import Any

from fastapi import APIRouter, HTTPException

from db import get_session
from models import Company, MediaList, PressRelease, Story, empty_breakdown
from schemas import CompanyUpdate, MediaListCreate, PressReleaseCreate, StoryCreate

router = APIRouter(prefix="/api/v1")

DEMO_COMPANY_ID = "99125"


def company_out(company: Company) -> dict[str, Any]:
    return {
        "id": company.id,
        "name": company.name,
        "nameKana": company.name_kana,
        "shortName": company.short_name,
        "foundedAt": company.founded_at,
        "representativeName": company.representative_name,
        "representativeTitle": company.representative_title,
        "postalCode": company.postal_code,
        "address": company.address,
        "phone": company.phone,
        "marketSegment": company.market_segment,
    }


def press_release_out(release: PressRelease) -> dict[str, Any]:
    return {
        "id": release.public_id,
        "title": release.title,
        "status": release.status,
        "updatedAt": release.updated_at.isoformat(),
        "url": release.url or f"https://latest.stg-prtimes.net/main/html/rd/p/{release.public_id}.000099125.html",
    }


def media_list_out(media_list: MediaList) -> dict[str, Any]:
    return {
        "id": media_list.public_id,
        "name": media_list.name,
        "updatedAt": media_list.updated_at.isoformat(),
        "count": media_list.count,
        "breakdown": media_list.breakdown,
    }


def story_out(story: Story) -> dict[str, Any]:
    return {
        "id": story.public_id,
        "title": story.title,
        "status": story.status,
        "updatedAt": story.updated_at.isoformat(),
        "url": story.url or f"https://latest.stg-prtimes.net/story/detail/{story.public_id}",
    }


@router.get("/company")
async def get_company() -> dict[str, Any]:
    with get_session() as session:
        company = session.get(Company, DEMO_COMPANY_ID)
        if company is None:
            raise HTTPException(status_code=404, detail="Company profile not found.")
        return company_out(company)


@router.put("/company")
async def update_company(request: CompanyUpdate) -> dict[str, Any]:
    with get_session() as session:
        company = session.get(Company, DEMO_COMPANY_ID)
        if company is None:
            raise HTTPException(status_code=404, detail="Company profile not found.")
        for field, value in request.model_dump(exclude_none=True).items():
            setattr(company, field, value)
        session.commit()
        session.refresh(company)
        return company_out(company)


@router.get("/press-releases")
async def list_press_releases() -> list[dict[str, Any]]:
    with get_session() as session:
        releases = session.query(PressRelease).order_by(PressRelease.id.desc()).all()
        return [press_release_out(release) for release in releases]


@router.post("/press-releases", status_code=201)
async def create_press_release(request: PressReleaseCreate) -> dict[str, Any]:
    with get_session() as session:
        release = PressRelease(
            title=request.title,
            body=request.body,
            status="公開済み" if request.publish else "下書き",
        )
        session.add(release)
        session.commit()
        session.refresh(release)
        return press_release_out(release)


@router.get("/press-releases/{release_id}")
async def get_press_release(release_id: str) -> dict[str, Any]:
    with get_session() as session:
        release = session.query(PressRelease).filter_by(id=int(release_id)).one_or_none()
        if release is None:
            raise HTTPException(status_code=404, detail="Press release not found.")
        return press_release_out(release)


@router.get("/media-lists")
async def list_media_lists() -> list[dict[str, Any]]:
    with get_session() as session:
        lists_ = session.query(MediaList).order_by(MediaList.id.desc()).all()
        return [media_list_out(item) for item in lists_]


@router.post("/media-lists", status_code=201)
async def create_media_list(request: MediaListCreate) -> dict[str, Any]:
    with get_session() as session:
        media_list = MediaList(name=request.name, count=0, breakdown=empty_breakdown())
        session.add(media_list)
        session.commit()
        session.refresh(media_list)
        return media_list_out(media_list)


@router.get("/media-lists/{list_id}")
async def get_media_list(list_id: str) -> dict[str, Any]:
    raw_id = list_id.removeprefix("list-")
    with get_session() as session:
        media_list = session.query(MediaList).filter_by(id=int(raw_id)).one_or_none()
        if media_list is None:
            raise HTTPException(status_code=404, detail="Media list not found.")
        return media_list_out(media_list)


@router.get("/stories")
async def list_stories() -> list[dict[str, Any]]:
    with get_session() as session:
        stories = session.query(Story).order_by(Story.id.desc()).all()
        return [story_out(story) for story in stories]


@router.post("/stories", status_code=201)
async def create_story(request: StoryCreate) -> dict[str, Any]:
    with get_session() as session:
        story = Story(title=request.title or "タイトル無し")
        session.add(story)
        session.commit()
        session.refresh(story)
        return story_out(story)


@router.get("/stories/{public_id}")
async def get_story(public_id: str) -> dict[str, Any]:
    with get_session() as session:
        story = session.query(Story).filter_by(public_id=public_id).one_or_none()
        if story is None:
            raise HTTPException(status_code=404, detail="Story not found.")
        return story_out(story)
