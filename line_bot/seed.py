from categories import CATEGORIES
from db import get_session
from models import Article, OwnReleaseView

SAMPLE_ARTICLES = [
    ("it", "アイティメディア株式会社", "「ITmedia NEWS」「ITmedia エグゼクティブ」がリニューアル",
     "https://prtimes.jp/main/html/rd/p/000000072.000001247.html"),
    ("it", "アイティメディア株式会社", "「Enterprise IT Summit 2026 spring」開催",
     "https://prtimes.jp/main/html/rd/p/000000062.000001247.html"),
    ("it", "株式会社Herix", "AIでデューデリジェンスを効率化するAI SaaS「Aidiligence」、β版の事前登録を開始",
     "https://prtimes.jp/main/html/rd/p/000000001.000162435.html"),
    ("beauty", "株式会社PR TIMES", "くすみ色「ミュートカラー」2.1倍・注目の新成分「PDRN」1.5倍、2026年上半期 美容トレンドワードランキングを発表",
     "https://prtimes.jp/main/html/rd/p/000001687.000000112.html"),
    ("beauty", "株式会社元林", "100円ショップで買える、新メイクアップブランド「mealis」誕生。",
     "https://prtimes.jp/main/html/rd/p/000000014.000003557.html"),
    ("beauty", "株式会社資生堂", "なめらかに、理想の素肌美へ。新体験のSHISEIDOファンデ美容液",
     "https://prtimes.jp/main/html/rd/p/000003118.000005794.html"),
    ("food", "サントリー食品インターナショナル株式会社", "「ギルティ炭酸 NOPE（ノープ）」3月24日（火）新発売！",
     "https://prtimes.jp/main/html/rd/p/000000792.000027480.html"),
    ("food", "株式会社カヤック", "【セブン‐イレブン新商品】果肉入り果汁飲料「カクカクカジツ ピクセルピーチ」6県限定発売",
     "https://prtimes.jp/main/html/rd/p/000000925.000014685.html"),
    ("food", "ダノンジャパン株式会社", "ダノン ビオ「世界旅行」シリーズ第7弾！秋のスペインをイメージした「洋梨＆ぶどう」新発売",
     "https://prtimes.jp/main/html/rd/p/000000020.000175740.html"),
    ("life", "株式会社プロスタイル", "【ひとり暮らしに最適！】月払い制の家電家具レンタルサービス「らくらくライフ」人気レンタル商品TOP10",
     "https://prtimes.jp/main/html/rd/p/000000002.000118225.html"),
    ("life", "パナソニックグループ", "小世帯のくらしに寄り添う“コンパクトなのに上質で心地よく過ごせる家電”を提案",
     "https://prtimes.jp/main/html/rd/p/000006359.000003442.html"),
    ("life", "株式会社インプレスホールディングス", "2025年ベスト家電は？読者が選ぶ「家電大賞 2025-2026」中間結果発表！",
     "https://prtimes.jp/main/html/rd/p/000007075.000005875.html"),
    ("entertainment", "株式会社カプコン", "ゲーム実況メインの生配信「カプコンTVチャレンジ!!」8月21日配信",
     "https://prtimes.jp/main/html/rd/p/000005260.000013450.html"),
    ("entertainment", "株式会社シリアルゲームズ", "マッチョが側転するゲーム『ローリングマッチョ』Nintendo Switch版が配信開始！",
     "https://prtimes.jp/main/html/rd/p/000000019.000020959.html"),
    ("entertainment", "グリーエンターテインメント株式会社", "『無職転生 〜異世界行ったら本気だす〜 クロニクル・オブ・エコーズ』本日より配信開始！",
     "https://prtimes.jp/main/html/rd/p/000000178.000090815.html"),
    ("sports", "ヤマチユナイテッド", "ジムの常識をアップデート。フィットネスジム「O-STYLE札幌月寒西」が誕生",
     "https://prtimes.jp/main/html/rd/p/000000187.000019420.html"),
    ("sports", "フィットイージー株式会社", "アミューズメントフィットネスクラブ FIT-EASY 一宮中島通店がグランドオープン",
     "https://prtimes.jp/main/html/rd/p/000000780.000099487.html"),
    ("sports", "株式会社東京ドーム", "『フィットネスクラブ東京ドーム ららぽーと柏の葉』が開業",
     "https://prtimes.jp/main/html/rd/p/000000424.000077656.html"),
]

SAMPLE_OWN_RELEASES = [
    ("新商品発売のお知らせ", "https://latest.stg-prtimes.net/main/html/rd/p/000000022.000099125.html", 128, 512),
    ("サービスリニューアルのご案内", "https://latest.stg-prtimes.net/main/html/rd/p/000000021.000099125.html", 64, 301),
    ("テスト配信リリース24", "https://latest.stg-prtimes.net/main/html/rd/p/000000024.000099125.html", 12, 12),
]


def seed_if_empty() -> None:
    with get_session() as session:
        if session.query(Article).count() == 0:
            valid_codes = {c["code"] for c in CATEGORIES}
            for category, company_name, title, url in SAMPLE_ARTICLES:
                assert category in valid_codes
                session.add(
                    Article(title=title, category=category, company_name=company_name, url=url)
                )

        if session.query(OwnReleaseView).count() == 0:
            for title, url, weekly, monthly in SAMPLE_OWN_RELEASES:
                session.add(
                    OwnReleaseView(title=title, url=url, weekly_views=weekly, monthly_views=monthly)
                )

        session.commit()
