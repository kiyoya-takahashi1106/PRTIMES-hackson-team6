CATEGORIES = [
    {"code": "it", "label": "IT・テクノロジー"},
    {"code": "beauty", "label": "美容・ファッション"},
    {"code": "food", "label": "食品・飲料"},
    {"code": "life", "label": "生活・くらし"},
    {"code": "entertainment", "label": "エンタメ"},
    {"code": "sports", "label": "スポーツ"},
]

CATEGORY_LABELS = {c["code"]: c["label"] for c in CATEGORIES}

COMPANY_SIZES = [
    {"code": "1_10", "label": "1〜10名"},
    {"code": "11_50", "label": "11〜50名"},
    {"code": "51_200", "label": "51〜200名"},
    {"code": "201_plus", "label": "201名以上"},
]

COMPANY_SIZE_LABELS = {s["code"]: s["label"] for s in COMPANY_SIZES}
