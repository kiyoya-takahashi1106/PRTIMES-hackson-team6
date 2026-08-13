# guide_panel バックエンド API

`guide_panel`（FastAPI）に、`prtimes_clone` フロントエンドから呼び出せる CRUD API を追加しました。
会社プロフィール・プレスリリース・メディアリスト・ストーリーを PostgreSQL（本番 RDS）または
ローカル SQLite（DB未接続時のフォールバック）に保存します。

## 1. セットアップ

### 環境変数（リポジトリ直下の `.env`）

`.env` はリポジトリ直下に置きます（`.gitignore` 済みなのでコミットされません）。

```env
DB_HOST=prtimes-hackathon-2026summer-db.cfq2m2o6cvor.ap-northeast-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=prtimes
DB_USER=hackathon
DB_PASSWORD=<実際のパスワード>
```

- `DB_PASSWORD` が未設定の場合は、自動的に `guide_panel/guide_panel.db`（SQLite）にフォールバックします。
  ローカルで動作確認したいだけなら `.env` なしでもそのまま起動できます。
- 上記4つ（HOST/PORT/NAME/USER）の代わりに、`DATABASE_URL`（例:
  `postgresql+psycopg2://user:pass@host:5432/dbname`）を直接指定することも可能です。

### ⚠️ RDS への接続について（既知の制約）

現在の開発コンテナ環境からは、RDS エンドポイント（および案内された
`demodatabase1.tianyibrad.com`）への TCP 接続がタイムアウト/拒否され、到達できませんでした。
RDS は VPC 内に置かれているために接続した端末から
実行する必要があります。実際の DB スキーマの調査・マイグレーションは、その環境から
`DB_PASSWORD` を設定した上で行ってください。

### 起動

```bash
cd guide_panel
./run.sh
```

`run.sh` が `.webapppr` 仮想環境を作成し、`requirements.txt`（`psycopg2-binary` 追加済み）を
インストールしてから `uvicorn main:app --reload` を起動します。デフォルトで
`http://127.0.0.1:8000` で待ち受けます。

起動時に `init_db()` でテーブルを自動作成し、`seed_if_empty()` でテーブルが空の場合のみ
デモデータを投入します（既存データがある場合は何もしません）。

### CORS

Vite の開発サーバー（`http://localhost:5173` / `http://127.0.0.1:5173`）からのアクセスを
デフォルトで許可しています。別のオリジンを使う場合は環境変数で上書きできます。

```env
GUIDE_PANEL_ALLOWED_ORIGINS=http://localhost:5173,https://example.com
```

## 2. API 一覧

ベースURL: `http://localhost:8000/api/v1`

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/company` | 会社プロフィールを取得 |
| PUT | `/company` | 会社プロフィールを更新（部分更新） |
| GET | `/press-releases` | プレスリリース一覧を取得（新しい順） |
| POST | `/press-releases` | プレスリリースを新規作成（下書き／配信） |
| GET | `/press-releases/{id}` | プレスリリース詳細を取得 |
| GET | `/media-lists` | メディアリスト一覧を取得 |
| POST | `/media-lists` | メディアリストを新規作成（空リスト） |
| GET | `/media-lists/{id}` | メディアリスト詳細を取得 |
| GET | `/stories` | ストーリー一覧を取得 |
| POST | `/stories` | ストーリーを新規作成 |
| GET | `/stories/{id}` | ストーリー詳細を取得 |

既存の `/api/health` や `/api/campaign/*`（配信ガイドパネル）はそのまま残っています。

### リクエスト／レスポンス例

```bash
# プレスリリース作成
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

`PressRelease` / `MediaList` / `Story` のフィールド名は `prtimes_clone/src/data/mockData.ts`
の型（`id` / `title` / `status` / `updatedAt` / `url` など）にそのまま合わせています。
`updatedAt` は ISO 8601 文字列を返すので、フロント側で任意の書式に変換してください。

## 3. フロントエンド（prtimes_clone）から使う

現状の `prtimes_clone` は `AppStateContext` が `localStorage` にモックデータを保存するだけで、
バックエンドへは未接続です。接続する場合は、例えば `.env`（Vite）で API のベースURLを指定し、

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

`fetch(`${import.meta.env.VITE_API_BASE_URL}/press-releases`)` のように呼び出せます。
`AppStateContext.tsx` の `addPressRelease` / `addMediaList` / `addStory` などを、
上記エンドポイントへの `fetch` 呼び出しに置き換えることで、実データと連携できます
（今回はバックエンド API の提供までを対応し、フロント側の全面差し替えは未実施です）。

## 4. ファイル構成

- `guide_panel/db.py` — DB接続設定（Postgres優先、未設定時はSQLiteへフォールバック）
- `guide_panel/models.py` — SQLAlchemy モデル（`Company` / `PressRelease` / `MediaList` / `Story`）
- `guide_panel/schemas.py` — リクエストボディの Pydantic スキーマ
- `guide_panel/seed.py` — 初回起動時のデモデータ投入
- `guide_panel/api.py` — `/api/v1/*` の CRUD エンドポイント（`main.py` に `include_router` 済み）
