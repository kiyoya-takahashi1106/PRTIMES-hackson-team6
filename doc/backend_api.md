# guide_panel バックエンド API

`guide_panel` は FastAPI 製の API サーバーです。
`prtimes_clone` から会社プロフィール、プレスリリース、メディアリスト、ストーリーを扱います。

## 起動

```bash
./guide_panel/run.sh
```

デフォルトは `http://127.0.0.1:8000` です。
DB 接続情報がない場合は `guide_panel/guide_panel.db` の SQLite にフォールバックします。

## 環境変数

リポジトリ直下の `.env` に設定します。

```env
DB_HOST=prtimes-hackathon-2026summer-db.cfq2m2o6cvor.ap-northeast-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=prtimes
DB_USER=hackathon
DB_PASSWORD=<実際のパスワード>
```

`DATABASE_URL` を直接指定することもできます。

```env
DATABASE_URL=postgresql+psycopg2://user:pass@host:5432/dbname
GUIDE_PANEL_ALLOWED_ORIGINS=http://localhost:5173
```

## API 一覧

ベースURL: `http://localhost:8000/api/v1`

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/company` | 会社プロフィール取得 |
| PUT | `/company` | 会社プロフィール更新 |
| GET | `/press-releases` | プレスリリース一覧 |
| POST | `/press-releases` | プレスリリース作成 |
| GET | `/press-releases/{id}` | プレスリリース詳細 |
| GET | `/media-lists` | メディアリスト一覧 |
| POST | `/media-lists` | メディアリスト作成 |
| GET | `/media-lists/{id}` | メディアリスト詳細 |
| POST | `/media-recommendations` | メディア推薦 |
| GET | `/stories` | ストーリー一覧 |
| POST | `/stories` | ストーリー作成 |
| GET | `/stories/{id}` | ストーリー詳細 |

ガイドパネル用に `/api/health`、`/api/campaign/start`、`/api/campaign/next` もあります。

## リクエスト例

```bash
curl -X POST http://localhost:8000/api/v1/press-releases \
  -H "Content-Type: application/json" \
  -d '{"title": "新商品発売のお知らせ", "body": "本文...", "publish": false}'
```

```json
{
  "id": "000000003",
  "title": "新商品発売のお知らせ",
  "status": "下書き",
  "updatedAt": "2026-08-13T12:29:40.592759",
  "url": "https://latest.stg-prtimes.net/main/html/rd/p/000000003.000099125.html"
}
```

## フロントエンドから使う

`prtimes_clone` 側で API ベースURLを指定します。

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 主要ファイル

- `guide_panel/main.py`: FastAPI アプリ
- `guide_panel/api.py`: `/api/v1/*` の API
- `guide_panel/recommendation.py`: メディア推薦
- `guide_panel/db.py`: DB 接続
- `guide_panel/models.py`: SQLAlchemy モデル
- `guide_panel/seed.py`: 初回デモデータ
