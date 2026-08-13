from db import get_session
from models import Company, MediaList, PressRelease, Story, empty_breakdown

DEMO_COMPANY = dict(
    id="99125",
    name="株式会社ハッカソン",
    name_kana="ハッカソン",
    short_name="未設定",
    founded_at="未設定",
    representative_name="ハッカソン代表",
    representative_title="事業主",
    postal_code="100-0000",
    address="ハッカソン",
    phone="080-9999-9999",
    market_segment="東証スタンダード",
)


def seed_if_empty() -> None:
    with get_session() as session:
        if session.get(Company, DEMO_COMPANY["id"]) is None:
            session.add(Company(**DEMO_COMPANY))

        if session.query(PressRelease).count() == 0:
            session.add(PressRelease(title="新商品発売のお知らせ", status="公開済み"))
            session.add(PressRelease(title="サービスリニューアルのご案内", status="予約済み"))

        if session.query(MediaList).count() == 0:
            session.add(
                MediaList(
                    name="IT・Web媒体リスト",
                    count=12,
                    breakdown=[
                        {"label": "テレビ", "value": 0},
                        {"label": "雑誌", "value": 1},
                        {"label": "新聞", "value": 0},
                        {"label": "Web", "value": 10},
                        {"label": "フリーペーパー", "value": 0},
                        {"label": "ラジオ", "value": 0},
                        {"label": "通信社", "value": 1},
                    ],
                )
            )

        if session.query(Story).count() == 0:
            session.add(Story(title="タイトル無し", status="下書き"))

        session.commit()


if __name__ == "__main__":
    from db import init_db

    init_db()
    seed_if_empty()
    print("Seed complete.")
