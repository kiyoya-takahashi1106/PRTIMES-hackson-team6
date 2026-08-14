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
    FlexBox,
    FlexBubble,
    FlexButton,
    FlexCarousel,
    FlexImage,
    FlexMessage,
    FlexText,
    Message,
    MessagingApi,
    PostbackAction,
    ReplyMessageRequest,
    TextMessage,
    URIAction,
)
from linebot.v3.webhooks import FollowEvent, MessageEvent, PostbackEvent, TextMessageContent

from categories import CATEGORIES, CATEGORY_LABELS, COMPANY_SIZES
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


def update_user(line_user_id: str, **fields: str) -> None:
    with get_session() as session:
        user = session.query(User).filter_by(line_user_id=line_user_id).one_or_none()
        if user is None:
            user = User(line_user_id=line_user_id)
            session.add(user)
        for key, value in fields.items():
            setattr(user, key, value)
        session.commit()


def build_button_flex(alt_text: str, title: str, choices: list[tuple[str, str, str]]) -> FlexMessage:
    """choices: list of (label, postback_data, display_text)"""
    contents: list = [FlexText(text=title, weight="bold", size="md", wrap=True)]
    for label, data, display_text in choices:
        contents.append(
            FlexButton(
                style="primary",
                color="#06C755",
                height="sm",
                margin="md",
                action=PostbackAction(label=label, data=data, display_text=display_text),
            )
        )
    bubble = FlexBubble(body=FlexBox(layout="vertical", spacing="sm", padding_all="20px", contents=contents))
    return FlexMessage(alt_text=alt_text, contents=bubble)


def account_type_flex() -> FlexMessage:
    return build_button_flex(
        alt_text="アカウント種別を選択してください",
        title="アカウント種別を選択してください",
        choices=[
            ("個人", "reg_type=individual", "個人"),
            ("法人", "reg_type=corporate", "法人"),
        ],
    )


def industry_flex() -> FlexMessage:
    return build_button_flex(
        alt_text="業界を選択してください",
        title="貴社の業界に近いものを選んでください",
        choices=[(c["label"], f"reg_industry={c['code']}", c["label"]) for c in CATEGORIES],
    )


def company_size_flex(industry_code: str) -> FlexMessage:
    return build_button_flex(
        alt_text="従業員規模を選択してください",
        title="貴社の従業員規模を教えてください",
        choices=[
            (s["label"], f"reg_size={s['code']}&reg_industry={industry_code}", s["label"])
            for s in COMPANY_SIZES
        ],
    )


def handle_recommend(line_bot_api: MessagingApi, user_id: str | None, reply_token: str) -> None:
    with get_session() as session:
        user = session.query(User).filter_by(line_user_id=user_id).one_or_none() if user_id else None

    if user and user.account_type == "individual" and user.favorite_category:
        messages = category_reply_messages(user.favorite_category)
    elif user and user.account_type == "corporate" and user.industry:
        messages = category_reply_messages(user.industry)
    else:
        messages = [
            TextMessage(text="まだ登録が完了していません。アカウント種別を選んでください。"),
            account_type_flex(),
        ]

    line_bot_api.reply_message(ReplyMessageRequest(reply_token=reply_token, messages=messages))


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


def category_reply_messages(category_code: str) -> list[Message]:
    label = CATEGORY_LABELS.get(category_code, category_code)
    with get_session() as session:
        articles = session.query(Article).filter_by(category=category_code).limit(5).all()

    if not articles:
        return [TextMessage(text=f"「{label}」の記事は見つかりませんでした。")]

    bubbles = [
        FlexBubble(
            hero=FlexImage(
                url=article.image_url,
                size="full",
                aspect_ratio="20:13",
                aspect_mode="cover",
            )
            if article.image_url
            else None,
            body=FlexBox(
                layout="vertical",
                spacing="sm",
                padding_all="16px",
                contents=[
                    FlexText(text=label, size="xs", color="#06C755", weight="bold"),
                    FlexText(text=article.title, weight="bold", size="md", wrap=True, margin="sm"),
                    FlexText(text=article.company_name, size="sm", color="#888888", wrap=True, margin="sm"),
                ],
            ),
            footer=FlexBox(
                layout="vertical",
                padding_all="16px",
                contents=[
                    FlexButton(
                        style="primary",
                        color="#06C755",
                        height="sm",
                        action=URIAction(label="記事を見る", uri=article.url),
                    )
                ],
            ),
        )
        for article in articles
    ]
    return [FlexMessage(alt_text=f"「{label}」の類似記事です", contents=FlexCarousel(contents=bubbles))]


def view_counts_reply() -> TextMessage:
    with get_session() as session:
        releases = session.query(OwnReleaseView).all()

    if not releases:
        return TextMessage(text="閲覧数のデータがまだありません。")

    weekly_total = sum(r.weekly_views for r in releases)
    monthly_total = sum(r.monthly_views for r in releases)
    lines = [f"【今週の閲覧数】合計 {weekly_total} PV", f"【今月の閲覧数】合計 {monthly_total} PV\n"]
    for release in releases:
        lines.append(f"・{release.title}\n  今週: {release.weekly_views} PV / 今月: {release.monthly_views} PV")
    return TextMessage(text="\n".join(lines))


def release_list_messages() -> list[Message]:
    with get_session() as session:
        releases = session.query(OwnReleaseView).all()

    if not releases:
        return [TextMessage(text="配信済みのプレスリリースがまだありません。")]

    bubbles = [
        FlexBubble(
            hero=FlexImage(
                url=release.image_url,
                size="full",
                aspect_ratio="20:13",
                aspect_mode="cover",
            )
            if release.image_url
            else None,
            body=FlexBox(
                layout="vertical",
                spacing="sm",
                padding_all="16px",
                contents=[
                    FlexText(text=release.title, weight="bold", size="md", wrap=True),
                    FlexText(
                        text=f"今週: {release.weekly_views} PV / 今月: {release.monthly_views} PV",
                        size="sm",
                        color="#888888",
                        wrap=True,
                        margin="sm",
                    ),
                    FlexText(
                        text=(
                            f"掲載メディア: {release.media_outlets.replace(',', '、')}"
                            if release.media_outlets
                            else "掲載メディア: -"
                        ),
                        size="sm",
                        color="#888888",
                        wrap=True,
                        margin="sm",
                    ),
                ],
            ),
            footer=FlexBox(
                layout="vertical",
                padding_all="16px",
                contents=[
                    FlexButton(
                        style="primary",
                        color="#06C755",
                        height="sm",
                        action=PostbackAction(label="詳細", data="release_detail=1", display_text="詳細"),
                    )
                ],
            ),
        )
        for release in releases
    ]
    return [FlexMessage(alt_text="プレスリリース詳細", contents=FlexCarousel(contents=bubbles))]


def handle_postback(line_bot_api: MessagingApi, user_id: str | None, reply_token: str, data: str) -> None:
    params = dict(parse_qsl(data))

    # --- registration steps: each sends its own message(s) and returns early ---
    if "reg_size" in params:
        industry_code = params.get("reg_industry", "")
        if user_id:
            update_user(
                user_id,
                account_type="corporate",
                industry=industry_code,
                company_size=params["reg_size"],
            )
            target = RICHMENU_IDS.get("corporate")
            if target:
                line_bot_api.link_rich_menu_id_to_user(user_id, target)
        intro = TextMessage(
            text=(
                "登録ありがとうございます!\n"
                "下部のメニューから「類似事例を見る」「プレスリリース管理」「アカウント連携」を選べます。"
            )
        )
        line_bot_api.reply_message(
            ReplyMessageRequest(
                reply_token=reply_token,
                messages=[intro, *category_reply_messages(industry_code)],
            )
        )
        return

    if "reg_industry" in params:
        line_bot_api.reply_message(
            ReplyMessageRequest(reply_token=reply_token, messages=[company_size_flex(params["reg_industry"])])
        )
        return

    if "reg_type" in params:
        if params["reg_type"] == "individual":
            if user_id:
                update_user(user_id, account_type="individual")
                target = RICHMENU_IDS.get("category")
                if target:
                    line_bot_api.link_rich_menu_id_to_user(user_id, target)
            reply_text = (
                "友だち追加ありがとうございます!\n"
                "このアカウントではPR TIMESのおすすめプレスリリースを定期配信していきます。\n\n"
                "下部のメニューから好きなジャンルをタップして選んでください。\n"
                "タップしたジャンルが「好きなジャンル」として保存されます。"
            )
            line_bot_api.reply_message(
                ReplyMessageRequest(reply_token=reply_token, messages=[TextMessage(text=reply_text)])
            )
        else:
            intro = TextMessage(
                text=(
                    "友だち追加ありがとうございます!\n"
                    "このアカウントでは参考になるおすすめプレスリリースの紹介や、"
                    "配信したプレスリリースの最新閲覧数などを確認できます。"
                )
            )
            line_bot_api.reply_message(
                ReplyMessageRequest(reply_token=reply_token, messages=[intro, industry_flex()])
            )
        return

    # --- ongoing browsing ---
    if "category" in params:
        code = params["category"]
        if user_id:
            update_user(user_id, account_type="individual", favorite_category=code)
        line_bot_api.reply_message(
            ReplyMessageRequest(reply_token=reply_token, messages=category_reply_messages(code))
        )
        return

    if "corp_similar" in params:
        industry_code = None
        if user_id:
            with get_session() as session:
                user = session.query(User).filter_by(line_user_id=user_id).one_or_none()
            industry_code = user.industry if user else None
        messages = (
            category_reply_messages(industry_code)
            if industry_code
            else [TextMessage(text="業界が未登録です。まずはアカウント登録を完了させてください。")]
        )
        line_bot_api.reply_message(ReplyMessageRequest(reply_token=reply_token, messages=messages))
        return

    if "press_release_manage" in params:
        if user_id:
            target = RICHMENU_IDS.get("press_release")
            if target:
                line_bot_api.link_rich_menu_id_to_user(user_id, target)
        reply_text = "「閲覧数確認」「プレスリリース詳細」「進捗管理」から選んでください。"
        line_bot_api.reply_message(
            ReplyMessageRequest(reply_token=reply_token, messages=[TextMessage(text=reply_text)])
        )
        return

    if "view_counts" in params:
        line_bot_api.reply_message(
            ReplyMessageRequest(reply_token=reply_token, messages=[view_counts_reply()])
        )
        return

    if "release_list" in params:
        line_bot_api.reply_message(
            ReplyMessageRequest(reply_token=reply_token, messages=release_list_messages())
        )
        return

    if "release_detail" in params:
        line_bot_api.reply_message(
            ReplyMessageRequest(
                reply_token=reply_token,
                messages=[TextMessage(text="この機能は準備中です。")],
            )
        )
        return

    if "progress" in params:
        line_bot_api.reply_message(
            ReplyMessageRequest(
                reply_token=reply_token,
                messages=[
                    build_button_flex(
                        alt_text="進捗管理",
                        title="前回の配信から114日が経過しています。\nそろそろ次の配信の準備をしましょう!",
                        choices=[("管理画面を開く", "admin_panel=1", "管理画面を開く")],
                    )
                ],
            )
        )
        return

    if "admin_panel" in params:
        line_bot_api.reply_message(
            ReplyMessageRequest(
                reply_token=reply_token,
                messages=[TextMessage(text="この機能は準備中です。")],
            )
        )
        return

    if "back_to_corporate" in params:
        if user_id:
            target = RICHMENU_IDS.get("corporate")
            if target:
                line_bot_api.link_rich_menu_id_to_user(user_id, target)
        reply_text = "「類似事例を見る」「プレスリリース管理」「アカウント連携」から選んでください。"
        line_bot_api.reply_message(
            ReplyMessageRequest(reply_token=reply_token, messages=[TextMessage(text=reply_text)])
        )
        return

    if "account_link" in params:
        line_bot_api.reply_message(
            ReplyMessageRequest(
                reply_token=reply_token,
                messages=[TextMessage(text="アカウント連携機能は準備中です。今しばらくお待ちください。")],
            )
        )
        return


def handle_follow(line_bot_api: MessagingApi, user_id: str | None, reply_token: str) -> None:
    if user_id:
        get_or_create_user(user_id)
    line_bot_api.reply_message(
        ReplyMessageRequest(reply_token=reply_token, messages=[account_type_flex()])
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
            if isinstance(event, FollowEvent):
                handle_follow(line_bot_api, event.source.user_id, event.reply_token)
                continue

            if isinstance(event, PostbackEvent):
                handle_postback(line_bot_api, event.source.user_id, event.reply_token, event.postback.data)
                continue

            if not isinstance(event, MessageEvent):
                continue
            if not isinstance(event.message, TextMessageContent):
                continue

            if event.source.user_id:
                get_or_create_user(event.source.user_id)

            if event.message.text.strip() == "おすすめ":
                handle_recommend(line_bot_api, event.source.user_id, event.reply_token)
                continue

            line_bot_api.reply_message(
                ReplyMessageRequest(
                    reply_token=event.reply_token,
                    messages=[
                        TextMessage(
                            text="メッセージへの返信には対応していません。下部のメニューから操作してください。"
                        )
                    ],
                )
            )

    return "OK"
