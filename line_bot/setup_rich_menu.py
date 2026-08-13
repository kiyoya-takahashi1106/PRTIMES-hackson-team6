"""One-off admin script: creates the rich menus on LINE, uploads their
images, links area actions, and sets menu 1 as the default for all users.

Run after generate_richmenu_images.py, and re-run whenever the layout changes
(it deletes any rich menus previously created by this script first).

    ../.webapppr/bin/python setup_rich_menu.py
"""

import json
import os
from pathlib import Path

from dotenv import load_dotenv
from linebot.v3.messaging import (
    ApiClient,
    Configuration,
    MessagingApi,
    MessagingApiBlob,
    PostbackAction,
    RichMenuArea,
    RichMenuBounds,
    RichMenuRequest,
    RichMenuSize,
)

from categories import CATEGORIES

BASE_DIR = Path(__file__).parent
load_dotenv(BASE_DIR.parent / ".env")

CHANNEL_ACCESS_TOKEN = os.environ["LINE_CHANNEL_ACCESS_TOKEN"]
configuration = Configuration(access_token=CHANNEL_ACCESS_TOKEN)

WIDTH, HEIGHT = 2500, 1686
IDS_FILE = BASE_DIR / "richmenu_ids.json"


def build_menu1_areas() -> list[RichMenuArea]:
    cell_w = WIDTH // 3
    cell_h = HEIGHT // 2
    areas = []
    for index, category in enumerate(CATEGORIES):
        row, col = divmod(index, 3)
        x0 = col * cell_w
        y0 = row * cell_h
        w = (WIDTH - x0) if col == 2 else cell_w
        h = (HEIGHT - y0) if row == 1 else cell_h
        areas.append(
            RichMenuArea(
                bounds=RichMenuBounds(x=x0, y=y0, width=w, height=h),
                action=PostbackAction(
                    data=f"category={category['code']}",
                    display_text=category["label"],
                ),
            )
        )
    return areas


def build_menu3_areas() -> list[RichMenuArea]:
    half = WIDTH // 2
    top_h = int(HEIGHT * 2 / 3)
    return [
        RichMenuArea(
            bounds=RichMenuBounds(x=0, y=0, width=half, height=top_h),
            action=PostbackAction(data="corp_similar=1", display_text="類似事例を見る"),
        ),
        RichMenuArea(
            bounds=RichMenuBounds(x=half, y=0, width=WIDTH - half, height=top_h),
            action=PostbackAction(data="press_release_manage=1", display_text="プレスリリース管理"),
        ),
        RichMenuArea(
            bounds=RichMenuBounds(x=0, y=top_h, width=WIDTH, height=HEIGHT - top_h),
            action=PostbackAction(data="account_link=1", display_text="アカウント連携"),
        ),
    ]


def build_menu4_areas() -> list[RichMenuArea]:
    col_w = WIDTH // 3
    top_h = int(HEIGHT * 2 / 3)
    return [
        RichMenuArea(
            bounds=RichMenuBounds(x=0, y=0, width=col_w, height=top_h),
            action=PostbackAction(data="view_counts=1", display_text="閲覧数確認"),
        ),
        RichMenuArea(
            bounds=RichMenuBounds(x=col_w, y=0, width=col_w, height=top_h),
            action=PostbackAction(data="release_list=1", display_text="プレスリリース詳細"),
        ),
        RichMenuArea(
            bounds=RichMenuBounds(x=2 * col_w, y=0, width=WIDTH - 2 * col_w, height=top_h),
            action=PostbackAction(data="progress=1", display_text="進捗管理"),
        ),
        RichMenuArea(
            bounds=RichMenuBounds(x=0, y=top_h, width=WIDTH, height=HEIGHT - top_h),
            action=PostbackAction(data="back_to_corporate=1", display_text="メインメニューに戻る"),
        ),
    ]


def delete_previous(messaging_api: MessagingApi) -> None:
    if not IDS_FILE.exists():
        return
    previous = json.loads(IDS_FILE.read_text())
    for menu_id in previous.values():
        try:
            messaging_api.delete_rich_menu(menu_id)
        except Exception as error:  # noqa: BLE001 best-effort cleanup
            print(f"  (skip deleting {menu_id}: {error})")


def main() -> None:
    with ApiClient(configuration) as api_client:
        messaging_api = MessagingApi(api_client)
        blob_api = MessagingApiBlob(api_client)

        print("Deleting rich menus from a previous run (if any)...")
        delete_previous(messaging_api)

        print("Creating menu 1 (category)...")
        menu1_id = messaging_api.create_rich_menu(
            RichMenuRequest(
                size=RichMenuSize(width=WIDTH, height=HEIGHT),
                selected=True,
                name="menu1-category",
                chat_bar_text="カテゴリから探す",
                areas=build_menu1_areas(),
            )
        ).rich_menu_id
        blob_api.set_rich_menu_image(
            menu1_id,
            body=(BASE_DIR / "static" / "richmenu" / "menu1_category.png").read_bytes(),
            _headers={"Content-Type": "image/png"},
        )

        print("Creating menu 3 (corporate)...")
        menu3_id = messaging_api.create_rich_menu(
            RichMenuRequest(
                size=RichMenuSize(width=WIDTH, height=HEIGHT),
                selected=False,
                name="menu3-corporate",
                chat_bar_text="法人メニュー",
                areas=build_menu3_areas(),
            )
        ).rich_menu_id
        blob_api.set_rich_menu_image(
            menu3_id,
            body=(BASE_DIR / "static" / "richmenu" / "menu3_corporate.png").read_bytes(),
            _headers={"Content-Type": "image/png"},
        )

        print("Creating menu 4 (press release management)...")
        menu4_id = messaging_api.create_rich_menu(
            RichMenuRequest(
                size=RichMenuSize(width=WIDTH, height=HEIGHT),
                selected=False,
                name="menu4-press-release",
                chat_bar_text="プレスリリース管理",
                areas=build_menu4_areas(),
            )
        ).rich_menu_id
        blob_api.set_rich_menu_image(
            menu4_id,
            body=(BASE_DIR / "static" / "richmenu" / "menu4_press_release.png").read_bytes(),
            _headers={"Content-Type": "image/png"},
        )

        print("Setting menu 1 as the default for all users...")
        messaging_api.set_default_rich_menu(menu1_id)

        ids = {"category": menu1_id, "corporate": menu3_id, "press_release": menu4_id}
        IDS_FILE.write_text(json.dumps(ids, indent=2))
        print(f"Saved rich menu IDs to {IDS_FILE}")
        print(ids)


if __name__ == "__main__":
    main()
