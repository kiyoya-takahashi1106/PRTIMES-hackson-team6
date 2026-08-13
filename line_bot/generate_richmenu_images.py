"""Generates the two rich menu PNG images used by setup_rich_menu.py.

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
    font_label = ImageFont.truetype(FONT_PATH_BOLD, 72)
    font_footer = ImageFont.truetype(FONT_PATH_BOLD, 80)

    cell_w = WIDTH // 3
    cell_h = HEIGHT // 3
    for index, category in enumerate(CATEGORIES):
        row, col = divmod(index, 3)
        x0, y0 = col * cell_w, row * cell_h
        x1 = x0 + cell_w if col < 2 else WIDTH
        y1 = y0 + cell_h
        color = ROW_COLORS[row % len(ROW_COLORS)]
        draw.rectangle([x0, y0, x1, y1], fill=color, outline="white", width=6)
        draw_centered_text(draw, (x0, y0, x1, y1), category["label"], font_label)

    footer_y0 = 2 * cell_h
    draw.rectangle([0, footer_y0, WIDTH, HEIGHT], fill=SWITCH_COLOR, outline="white", width=6)
    draw_centered_text(draw, (0, footer_y0, WIDTH, HEIGHT), "閲覧数を見る ▶", font_footer)

    img.save(OUT_DIR / "menu1_category.png")


def build_menu2() -> None:
    img = Image.new("RGB", (WIDTH, HEIGHT), "white")
    draw = ImageDraw.Draw(img)
    font_label = ImageFont.truetype(FONT_PATH_BOLD, 88)
    font_footer = ImageFont.truetype(FONT_PATH_BOLD, 80)

    top_h = int(HEIGHT * 2 / 3)
    draw.rectangle([0, 0, WIDTH // 2, top_h], fill="#2E7D6B", outline="white", width=6)
    draw_centered_text(draw, (0, 0, WIDTH // 2, top_h), "今週の閲覧数", font_label)

    draw.rectangle([WIDTH // 2, 0, WIDTH, top_h], fill="#2E6B7D", outline="white", width=6)
    draw_centered_text(draw, (WIDTH // 2, 0, WIDTH, top_h), "今月の閲覧数", font_label)

    draw.rectangle([0, top_h, WIDTH, HEIGHT], fill=SWITCH_COLOR, outline="white", width=6)
    draw_centered_text(draw, (0, top_h, WIDTH, HEIGHT), "◀ 類似記事に戻る", font_footer)

    img.save(OUT_DIR / "menu2_views.png")


if __name__ == "__main__":
    build_menu1()
    build_menu2()
    print(f"saved to {OUT_DIR}")
