from categories import CATEGORIES
from db import get_session
from models import Article, OwnReleaseView

SAMPLE_ARTICLES = [
    ("it", "アイティメディア株式会社", "「ITmedia NEWS」「ITmedia エグゼクティブ」がリニューアル",
     "https://prtimes.jp/main/html/rd/p/000000072.000001247.html",
     "https://prcdn.freetls.fastly.net/release_image/1247/72/1247-72-25c4f0833ac5648f4e461c4148836015-1105x276.jpg?format=jpeg&auto=webp&fit=bounds&width=2400&height=1260"),
    ("it", "アイティメディア株式会社", "「Enterprise IT Summit 2026 spring」開催",
     "https://prtimes.jp/main/html/rd/p/000000062.000001247.html",
     "https://prcdn.freetls.fastly.net/release_image/1247/62/1247-62-c913c8983eb7bb908fae16f865a08f2e-1200x630.png?format=jpeg&auto=webp&fit=bounds&width=2400&height=1260"),
    ("it", "株式会社Herix", "AIでデューデリジェンスを効率化するAI SaaS「Aidiligence」、β版の事前登録を開始",
     "https://prtimes.jp/main/html/rd/p/000000001.000162435.html",
     "https://prcdn.freetls.fastly.net/release_image/162435/1/162435-1-4ba491e59f12d2c459e4ef5ac8ec3b20-2898x1592.png?format=jpeg&auto=webp&fit=bounds&width=2400&height=1260"),
    ("beauty", "株式会社PR TIMES", "くすみ色「ミュートカラー」2.1倍・注目の新成分「PDRN」1.5倍、2026年上半期 美容トレンドワードランキングを発表",
     "https://prtimes.jp/main/html/rd/p/000001687.000000112.html",
     "https://prcdn.freetls.fastly.net/release_image/112/1687/112-1687-8ea470f8a9594bf404f1f22ece3aa0e1-3900x2194.jpg?format=jpeg&auto=webp&fit=bounds&width=2400&height=1260"),
    ("beauty", "株式会社元林", "100円ショップで買える、新メイクアップブランド「mealis」誕生。",
     "https://prtimes.jp/main/html/rd/p/000000014.000003557.html",
     "https://prcdn.freetls.fastly.net/release_image/3557/14/3557-14-9195c86c2b6a4214d12e66e796ac7d86-1080x1350.png?format=jpeg&auto=webp&fit=bounds&width=2400&height=1260"),
    ("beauty", "株式会社資生堂", "なめらかに、理想の素肌美へ。新体験のSHISEIDOファンデ美容液",
     "https://prtimes.jp/main/html/rd/p/000003118.000005794.html",
     "https://prcdn.freetls.fastly.net/release_image/5794/3118/5794-3118-4e87ac99da4ce90968a60b19b2069c38-3200x1800.jpg?format=jpeg&auto=webp&fit=bounds&width=2400&height=1260"),
    ("food", "サントリー食品インターナショナル株式会社", "「ギルティ炭酸 NOPE（ノープ）」3月24日（火）新発売！",
     "https://prtimes.jp/main/html/rd/p/000000792.000027480.html",
     "https://prcdn.freetls.fastly.net/release_image/27480/792/27480-792-df02f7e77234a9e5f0d360be3130a030-2000x1260.jpg?format=jpeg&auto=webp&fit=bounds&width=2400&height=1260"),
    ("food", "株式会社カヤック", "【セブン‐イレブン新商品】果肉入り果汁飲料「カクカクカジツ ピクセルピーチ」6県限定発売",
     "https://prtimes.jp/main/html/rd/p/000000925.000014685.html",
     "https://prcdn.freetls.fastly.net/release_image/14685/925/14685-925-f1f8c1c099db4200f26afa936bd9e6d6-3841x2011.png?format=jpeg&auto=webp&fit=bounds&width=2400&height=1260"),
    ("food", "ダノンジャパン株式会社", "ダノン ビオ「世界旅行」シリーズ第7弾！秋のスペインをイメージした「洋梨＆ぶどう」新発売",
     "https://prtimes.jp/main/html/rd/p/000000020.000175740.html",
     "https://prcdn.freetls.fastly.net/release_image/175740/20/175740-20-5ec83a9cdc62dd2c6fb9d09fbda95024-594x312.jpg?format=jpeg&auto=webp&fit=bounds&width=2400&height=1260"),
    ("life", "株式会社プロスタイル", "【ひとり暮らしに最適！】月払い制の家電家具レンタルサービス「らくらくライフ」人気レンタル商品TOP10",
     "https://prtimes.jp/main/html/rd/p/000000002.000118225.html",
     "https://prcdn.freetls.fastly.net/release_image/118225/2/118225-2-b1131af3b8028abbedcf28a364b284f0-1440x505.png?format=jpeg&auto=webp&fit=bounds&width=2400&height=1260"),
    ("life", "パナソニックグループ", "小世帯のくらしに寄り添う“コンパクトなのに上質で心地よく過ごせる家電”を提案",
     "https://prtimes.jp/main/html/rd/p/000006359.000003442.html",
     "https://prcdn.freetls.fastly.net/release_image/3442/6359/3442-6359-7e73b444d709f0fe3a08275ae8f000b1-1600x663.jpg?format=jpeg&auto=webp&fit=bounds&width=2400&height=1260"),
    ("life", "株式会社インプレスホールディングス", "2025年ベスト家電は？読者が選ぶ「家電大賞 2025-2026」中間結果発表！",
     "https://prtimes.jp/main/html/rd/p/000007075.000005875.html",
     "https://prcdn.freetls.fastly.net/release_image/5875/7075/5875-7075-8fdc7a663eff872930bd7f935c796108-1393x608.jpg?format=jpeg&auto=webp&fit=bounds&width=2400&height=1260"),
    ("entertainment", "株式会社カプコン", "ゲーム実況メインの生配信「カプコンTVチャレンジ!!」8月21日配信",
     "https://prtimes.jp/main/html/rd/p/000005260.000013450.html",
     "https://prcdn.freetls.fastly.net/release_image/13450/5260/13450-5260-f2dd22ac64cc9b3a7769cdbd0e831ab0-3900x2600.jpg?format=jpeg&auto=webp&fit=bounds&width=2400&height=1260"),
    ("entertainment", "株式会社シリアルゲームズ", "マッチョが側転するゲーム『ローリングマッチョ』Nintendo Switch版が配信開始！",
     "https://prtimes.jp/main/html/rd/p/000000019.000020959.html",
     "https://prcdn.freetls.fastly.net/release_image/20959/19/20959-19-04f76a13cd6a228a11e61e499960d83d-800x450.png?format=jpeg&auto=webp&fit=bounds&width=2400&height=1260"),
    ("entertainment", "グリーエンターテインメント株式会社", "『無職転生 〜異世界行ったら本気だす〜 クロニクル・オブ・エコーズ』本日より配信開始！",
     "https://prtimes.jp/main/html/rd/p/000000178.000090815.html",
     "https://prcdn.freetls.fastly.net/release_image/90815/178/90815-178-378a9505ddb84ba50ef9224ccdba7f96-1920x1080.png?format=jpeg&auto=webp&fit=bounds&width=2400&height=1260"),
    ("sports", "ヤマチユナイテッド", "ジムの常識をアップデート。フィットネスジム「O-STYLE札幌月寒西」が誕生",
     "https://prtimes.jp/main/html/rd/p/000000187.000019420.html",
     "https://prcdn.freetls.fastly.net/release_image/19420/187/19420-187-9b0da922cc923684d86f07fc3783066b-1912x2700.jpg?format=jpeg&auto=webp&fit=bounds&width=2400&height=1260"),
    ("sports", "フィットイージー株式会社", "アミューズメントフィットネスクラブ FIT-EASY 一宮中島通店がグランドオープン",
     "https://prtimes.jp/main/html/rd/p/000000780.000099487.html",
     "https://prcdn.freetls.fastly.net/release_image/99487/780/99487-780-d96decc6001e4b61e2c67c47a0d5eb5f-3900x2600.jpg?format=jpeg&auto=webp&fit=bounds&width=2400&height=1260"),
    ("sports", "株式会社東京ドーム", "『フィットネスクラブ東京ドーム ららぽーと柏の葉』が開業",
     "https://prtimes.jp/main/html/rd/p/000000424.000077656.html",
     "https://prcdn.freetls.fastly.net/release_image/77656/424/77656-424-ce2a7a9b66b378be27844ed4a90b0490-3500x2303.jpg?format=jpeg&auto=webp&fit=bounds&width=2400&height=1260"),
]

SAMPLE_OWN_RELEASES = [
    ("新商品発売のお知らせ", "https://latest.stg-prtimes.net/main/html/rd/p/000000022.000099125.html", 128, 512,
     "Yahoo!ニュース,ITmedia NEWS,@Press",
     "https://placehold.co/1200x630/2E7D6B/FFFFFF.png?text=PRESS+RELEASE"),
    ("サービスリニューアルのご案内", "https://latest.stg-prtimes.net/main/html/rd/p/000000021.000099125.html", 64, 301,
     "MarkeZine,ValuePress!",
     "https://placehold.co/1200x630/2E6B7D/FFFFFF.png?text=PRESS+RELEASE"),
    ("テスト配信リリース24", "https://latest.stg-prtimes.net/main/html/rd/p/000000024.000099125.html", 12, 12,
     "SankeiBiz",
     "https://placehold.co/1200x630/4A6B2E/FFFFFF.png?text=PRESS+RELEASE"),
]


def seed_if_empty() -> None:
    with get_session() as session:
        if session.query(Article).count() == 0:
            valid_codes = {c["code"] for c in CATEGORIES}
            for category, company_name, title, url, image_url in SAMPLE_ARTICLES:
                assert category in valid_codes
                session.add(
                    Article(
                        title=title,
                        category=category,
                        company_name=company_name,
                        url=url,
                        image_url=image_url,
                    )
                )

        if session.query(OwnReleaseView).count() == 0:
            for title, url, weekly, monthly, media_outlets, image_url in SAMPLE_OWN_RELEASES:
                session.add(
                    OwnReleaseView(
                        title=title,
                        url=url,
                        weekly_views=weekly,
                        monthly_views=monthly,
                        media_outlets=media_outlets,
                        image_url=image_url,
                    )
                )

        session.commit()
