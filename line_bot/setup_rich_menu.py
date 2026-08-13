"""One-off admin script: creates the two rich menus on LINE, uploads their
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
    cell_h = HEIGHT // 3
    areas = []
    for index, category in enumerate(CATEGORIES):
        row, col = divmod(index, 3)
        x0 = col * cell_w
        w = (WIDTH - x0) if col == 2 else cell_w
        areas.append(
            RichMenuArea(
                bounds=RichMenuBounds(x=x0, y=row * cell_h, width=w, height=cell_h),
                action=PostbackAction(
                    data=f"category={category['code']}",
                    display_text=category["label"],
                ),
            )
        )
    footer_y0 = 2 * cell_h
    areas.append(
        RichMenuArea(
            bounds=RichMenuBounds(x=0, y=footer_y0, width=WIDTH, height=HEIGHT - footer_y0),
            action=PostbackAction(data="switch_menu=views", display_text="閲覧数を見る"),
        )
    )
    return areas


def build_menu2_areas() -> list[RichMenuArea]:
    top_h = int(HEIGHT * 2 / 3)
    return [
        RichMenuArea(
            bounds=RichMenuBounds(x=0, y=0, width=WIDTH // 2, height=top_h),
            action=PostbackAction(data="view=weekly", display_text="今週の閲覧数"),
        ),
        RichMenuArea(
            bounds=RichMenuBounds(x=WIDTH // 2, y=0, width=WIDTH - WIDTH // 2, height=top_h),
            action=PostbackAction(data="view=monthly", display_text="今月の閲覧数"),
        ),
        RichMenuArea(
            bounds=RichMenuBounds(x=0, y=top_h, width=WIDTH, height=HEIGHT - top_h),
            action=PostbackAction(data="switch_menu=category", display_text="類似記事に戻る"),
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

        print("Creating menu 2 (views)...")
        menu2_id = messaging_api.create_rich_menu(
            RichMenuRequest(
                size=RichMenuSize(width=WIDTH, height=HEIGHT),
                selected=False,
                name="menu2-views",
                chat_bar_text="閲覧数を見る",
                areas=build_menu2_areas(),
            )
        ).rich_menu_id
        blob_api.set_rich_menu_image(
            menu2_id,
            body=(BASE_DIR / "static" / "richmenu" / "menu2_views.png").read_bytes(),
            _headers={"Content-Type": "image/png"},
        )

        print("Setting menu 1 as the default for all users...")
        messaging_api.set_default_rich_menu(menu1_id)

        ids = {"category": menu1_id, "views": menu2_id}
        IDS_FILE.write_text(json.dumps(ids, indent=2))
        print(f"Saved rich menu IDs to {IDS_FILE}")
        print(ids)


if __name__ == "__main__":
    main()
