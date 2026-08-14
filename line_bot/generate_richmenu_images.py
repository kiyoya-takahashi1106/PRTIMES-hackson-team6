"""Generates the rich menu PNG images used by setup_rich_menu.py.

Run once (or whenever the layout/labels change):
    ../.webapppr/bin/python generate_richmenu_images.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from categories import CATEGORIES

OUT_DIR = Path(__file__).parent / "static" / "richmenu"
OUT_DIR.mkdir(parents=True, exist_ok=True)

WIDTH, HEIGHT = 2500, 1686
FONT_PATH = "/System/Library/Fonts/ヒラギノ角ゴシック W4.ttc"
FONT_PATH_BOLD = "/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc"

ROW_COLORS = ["#2E7D6B", "#2E6B7D", "#4A6B2E"]
SWITCH_COLOR = "#1F3B4D"
TEXT_COLOR = "white"


def draw_centered_text(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], text: str, font: ImageFont.FreeTypeFont) -> None:
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    lines = text.split("\n")
    line_heights = [draw.textbbox((0, 0), line, font=font)[3] for line in lines]
    total_h = sum(line_heights) + 10 * (len(lines) - 1)
    y = cy - total_h // 2
    for line, lh in zip(lines, line_heights):
        w = draw.textbbox((0, 0), line, font=font)[2]
        draw.text((cx - w // 2, y), line, font=font, fill=TEXT_COLOR)
        y += lh + 10


def build_menu1() -> None:
    img = Image.new("RGB", (WIDTH, HEIGHT), "white")
    draw = ImageDraw.Draw(img)
    font_label = ImageFont.truetype(FONT_PATH_BOLD, 84)

    cell_w = WIDTH // 3
    cell_h = HEIGHT // 2
    for index, category in enumerate(CATEGORIES):
        row, col = divmod(index, 3)
        x0, y0 = col * cell_w, row * cell_h
        x1 = x0 + cell_w if col < 2 else WIDTH
        y1 = y0 + cell_h if row < 1 else HEIGHT
        color = ROW_COLORS[index % len(ROW_COLORS)]
        draw.rectangle([x0, y0, x1, y1], fill=color, outline="white", width=6)
        draw_centered_text(draw, (x0, y0, x1, y1), category["label"], font_label)

    img.save(OUT_DIR / "menu1_category.png")


def build_menu3() -> None:
    img = Image.new("RGB", (WIDTH, HEIGHT), "white")
    draw = ImageDraw.Draw(img)
    font_label = ImageFont.truetype(FONT_PATH_BOLD, 76)
    font_footer = ImageFont.truetype(FONT_PATH_BOLD, 72)

    half = WIDTH // 2
    top_h = int(HEIGHT * 2 / 3)

    draw.rectangle([0, 0, half, top_h], fill="#2E7D6B", outline="white", width=6)
    draw_centered_text(draw, (0, 0, half, top_h), "類似事例を\n見る", font_label)

    draw.rectangle([half, 0, WIDTH, top_h], fill="#2E6B7D", outline="white", width=6)
    draw_centered_text(draw, (half, 0, WIDTH, top_h), "プレスリリース\n管理", font_label)

    draw.rectangle([0, top_h, WIDTH, HEIGHT], fill=SWITCH_COLOR, outline="white", width=6)
    draw_centered_text(draw, (0, top_h, WIDTH, HEIGHT), "アカウント連携", font_footer)

    img.save(OUT_DIR / "menu3_corporate.png")


def build_menu4() -> None:
    img = Image.new("RGB", (WIDTH, HEIGHT), "white")
    draw = ImageDraw.Draw(img)
    font_label = ImageFont.truetype(FONT_PATH_BOLD, 64)
    font_footer = ImageFont.truetype(FONT_PATH_BOLD, 72)

    col_w = WIDTH // 3
    top_h = int(HEIGHT * 2 / 3)
    labels = ["閲覧数確認", "プレスリリース\n詳細", "進捗管理"]
    for index, label in enumerate(labels):
        x0 = index * col_w
        x1 = x0 + col_w if index < 2 else WIDTH
        color = ROW_COLORS[index % len(ROW_COLORS)]
        draw.rectangle([x0, 0, x1, top_h], fill=color, outline="white", width=6)
        draw_centered_text(draw, (x0, 0, x1, top_h), label, font_label)

    draw.rectangle([0, top_h, WIDTH, HEIGHT], fill=SWITCH_COLOR, outline="white", width=6)
    draw_centered_text(draw, (0, top_h, WIDTH, HEIGHT), "◀ メインメニューに戻る", font_footer)

    img.save(OUT_DIR / "menu4_press_release.png")


if __name__ == "__main__":
    build_menu1()
    build_menu3()
    build_menu4()
    print(f"saved to {OUT_DIR}")
