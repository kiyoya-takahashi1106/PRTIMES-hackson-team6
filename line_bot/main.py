import json
import os
from pathlib import Path
from urllib.parse import parse_qsl

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from linebot.v3 import WebhookParser
from linebot.v3.exceptions import InvalidSignatureError
from linebot.v3.messaging import (
    ApiClient,
    Configuration,
    MessagingApi,
    ReplyMessageRequest,
    TextMessage,
)
from linebot.v3.webhooks import MessageEvent, PostbackEvent, TextMessageContent

from categories import CATEGORY_LABELS
from db import get_session, init_db
from models import Article, OwnReleaseView, User
from seed import seed_if_empty

BASE_DIR = Path(__file__).parent
load_dotenv(BASE_DIR.parent / ".env")

CHANNEL_SECRET = os.environ["LINE_CHANNEL_SECRET"]
CHANNEL_ACCESS_TOKEN = os.environ["LINE_CHANNEL_ACCESS_TOKEN"]
RICHMENU_IDS_FILE = BASE_DIR / "richmenu_ids.json"
RICHMENU_IDS: dict[str, str] = (
    json.loads(RICHMENU_IDS_FILE.read_text()) if RICHMENU_IDS_FILE.exists() else {}
)

configuration = Configuration(access_token=CHANNEL_ACCESS_TOKEN)
parser = WebhookParser(CHANNEL_SECRET)

app = FastAPI(title="PR TIMES LINE Bot")
init_db()
seed_if_empty()


def get_or_create_user(line_user_id: str) -> User:
    with get_session() as session:
        user = session.query(User).filter_by(line_user_id=line_user_id).one_or_none()
        if user is None:
            user = User(line_user_id=line_user_id)
            session.add(user)
            session.commit()
            session.refresh(user)
        return user


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


def build_category_reply(category_code: str) -> str:
    label = CATEGORY_LABELS.get(category_code, category_code)
    with get_session() as session:
        articles = session.query(Article).filter_by(category=category_code).limit(5).all()

    if not articles:
        return f"「{label}」の記事は見つかりませんでした。"

    lines = [f"【{label}】の類似記事です\n"]
    for article in articles:
        lines.append(f"■ {article.title}（{article.company_name}）\n{article.url}\n")
    return "\n".join(lines).strip()


def build_view_reply(period: str) -> str:
    with get_session() as session:
        releases = session.query(OwnReleaseView).all()

    if period == "weekly":
        title, key = "今週の閲覧数", "weekly_views"
    else:
        title, key = "今月の閲覧数", "monthly_views"

    if not releases:
        return f"{title}のデータがまだありません。"

    total = sum(getattr(release, key) for release in releases)
    lines = [f"【{title}】\n合計 {total} PV\n"]
    for release in sorted(releases, key=lambda r: getattr(r, key), reverse=True):
        lines.append(f"・{release.title}: {getattr(release, key)} PV")
    return "\n".join(lines).strip()


def handle_postback(line_bot_api: MessagingApi, user_id: str | None, reply_token: str, data: str) -> None:
    params = dict(parse_qsl(data))

    if "category" in params:
        reply_text = build_category_reply(params["category"])
    elif "view" in params:
        reply_text = build_view_reply(params["view"])
    elif "switch_menu" in params:
        target = RICHMENU_IDS.get(params["switch_menu"])
        if user_id and target:
            line_bot_api.link_rich_menu_id_to_user(user_id, target)
        reply_text = (
            "カテゴリをタップして類似記事を見てみましょう。"
            if params["switch_menu"] == "category"
            else "今週・今月どちらの閲覧数を見ますか?"
        )
    else:
        return

    line_bot_api.reply_message(
        ReplyMessageRequest(reply_token=reply_token, messages=[TextMessage(text=reply_text)])
    )


@app.post("/webhook")
async def webhook(request: Request) -> str:
    signature = request.headers.get("X-Line-Signature", "")
    body = (await request.body()).decode("utf-8")

    try:
        events = parser.parse(body, signature)
    except InvalidSignatureError as error:
        raise HTTPException(status_code=400, detail="Invalid signature") from error

    with ApiClient(configuration) as api_client:
        line_bot_api = MessagingApi(api_client)
        for event in events:
            if isinstance(event, PostbackEvent):
                handle_postback(line_bot_api, event.source.user_id, event.reply_token, event.postback.data)
                continue

            if not isinstance(event, MessageEvent):
                continue
            if not isinstance(event.message, TextMessageContent):
                continue

            if event.source.user_id:
                get_or_create_user(event.source.user_id)

            line_bot_api.reply_message(
                ReplyMessageRequest(
                    reply_token=event.reply_token,
                    messages=[TextMessage(text=event.message.text)],
                )
            )

    return "OK"
