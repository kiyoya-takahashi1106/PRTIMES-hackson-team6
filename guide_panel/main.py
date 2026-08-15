from __future__ import annotations

import os
from pathlib import Path
from typing import Any, TypedDict
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from api import router as api_router
from db import engine, init_db
from seed import seed_if_empty

BASE_DIR = Path(__file__).parent
STATIC_DIR = BASE_DIR / "static"
FLOW = json.loads((STATIC_DIR / "campaign-flow.json").read_text())
STEPS = FLOW["steps"]


class CampaignState(TypedDict):
    step_index: int
    answers: dict[str, Any]
    published: bool


campaign_state: CampaignState = {"step_index": 0, "answers": {}, "published": False}

# TODO Change this to .env instead of hardcoding
app = FastAPI(title="PR TIMES Demo Panel")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

allowed_origins = os.environ.get(
    "GUIDE_PANEL_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# The local demo owns its SQLite schema. PostgreSQL is an existing shared database
# and must not receive demo tables as a side effect of starting this API.
if engine.dialect.name == "sqlite":
    init_db()
    seed_if_empty()
app.include_router(api_router)

class NextStepRequest(BaseModel):
    step_id: str
    answers: dict[str, Any] = Field(default_factory=dict)

def visible_steps(step_index: int, answers: dict[str, Any]) -> list[dict[str, Any]]:
    route = answers.get("route")
    return [
        step for step in STEPS[: step_index + 1]
        if not step.get("branch") or step["branch"] == route
    ]

def route_path(route: str | None) -> list[dict[str, Any]]:
    if route:
        return [step for step in STEPS if not step.get("branch") or step["branch"] == route]
    # Route not chosen yet: estimate the path length with a single placeholder for the pending branch.
    return [step for step in STEPS if not step.get("branch")]

def step_response(step_index: int, answers: dict[str, Any] | None = None) -> dict[str, Any]:
    answers = answers or {}
    step = STEPS[step_index]
    route = answers.get("route")
    path = route_path(route)
    total_steps = len(path) if route else len(path) + 1
    step_position = next((index + 1 for index, item in enumerate(path) if item["id"] == step["id"]), total_steps)
    return {
        "campaign": FLOW["campaign"],
        "current_step": step,
        "visible_steps": visible_steps(step_index, answers),
        "step_index": step_index,
        "step_position": step_position,
        "total_steps": total_steps,
        "answers": answers,
        "read_only": campaign_state["published"],
    }


def next_step_index(current_index: int, answers: dict[str, Any]) -> int:
    current_step = STEPS[current_index]

    if current_step["id"] == "writing-route":
        route = answers.get("route")
        return next(index for index, step in enumerate(STEPS) if step["id"] == (
            "self-publish-content" if route == "self-publish" else "service-materials"
        ))

    if current_step["id"] == "service-interview":
        return next(index for index, step in enumerate(STEPS) if step["id"] == "publication-schedule")

    if current_step["id"] == "self-publish-content":
        return next(index for index, step in enumerate(STEPS) if step["id"] == "publication-schedule")

    if current_step["id"] == "service-materials":
        return next(index for index, step in enumerate(STEPS) if step["id"] == "service-interview")

    return min(current_index + 1, len(STEPS) - 1)


@app.get("/", response_class=FileResponse)
async def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/health")
async def health() -> JSONResponse:
    return JSONResponse({"status": "ok"})


@app.get("/api/campaign/start")
async def campaign_start() -> JSONResponse:
    return JSONResponse(step_response(campaign_state["step_index"], campaign_state["answers"]))


@app.post("/api/campaign/next")
async def campaign_next(request: NextStepRequest) -> JSONResponse:
    published = campaign_state["published"]
    if published and STEPS[campaign_state["step_index"]]["id"] == "submitted":
        raise HTTPException(status_code=409, detail="This campaign is already published.")

    # TODO once published, we should not allow changing answers. For now, we allow it for testing purposes.
    # TODO data should be saved
    answers = campaign_state["answers"] if published else request.answers

    try:
        current_index = next(index for index, step in enumerate(STEPS) if step["id"] == request.step_id)
        if not published and request.step_id == "writing-route" and answers.get("route") not in {
            "self-publish",
            "pr-times-writing-service",
        }:
            raise HTTPException(status_code=422, detail="Choose a writing route before continuing.")
        next_index = next_step_index(current_index, answers)
    except StopIteration as error:
        raise HTTPException(status_code=404, detail="Unknown campaign step.") from error

    campaign_state["step_index"] = next_index
    if not published:
        campaign_state["answers"] = answers
    if STEPS[next_index]["id"] == "submitted":
        campaign_state["published"] = True
    return JSONResponse(step_response(next_index, campaign_state["answers"]))


@app.post("/api/campaign/back")
async def campaign_back(request: NextStepRequest) -> JSONResponse:
    try:
        current_index = next(index for index, step in enumerate(STEPS) if step["id"] == request.step_id)
    except StopIteration as error:
        raise HTTPException(status_code=404, detail="Unknown campaign step.") from error

    visible_indices = [
        index for index, step in enumerate(STEPS[: current_index + 1])
        if not step.get("branch") or step["branch"] == request.answers.get("route")
    ]
    previous_index = visible_indices[-2] if len(visible_indices) > 1 else 0

    campaign_state["step_index"] = previous_index
    campaign_state["answers"] = request.answers
    return JSONResponse(step_response(previous_index, campaign_state["answers"]))


@app.post("/api/campaign/goto")
async def campaign_goto(request: NextStepRequest) -> JSONResponse:
    try:
        target_index = next(index for index, step in enumerate(STEPS) if step["id"] == request.step_id)
    except StopIteration as error:
        raise HTTPException(status_code=404, detail="Unknown campaign step.") from error

    current_index = campaign_state["step_index"]
    current_visible_indices = [
        index for index, step in enumerate(STEPS[: current_index + 1])
        if not step.get("branch") or step["branch"] == campaign_state["answers"].get("route")
    ]
    if target_index not in current_visible_indices:
        raise HTTPException(status_code=403, detail="That campaign step is not available yet.")

    campaign_state["step_index"] = target_index
    return JSONResponse(step_response(target_index, campaign_state["answers"]))
