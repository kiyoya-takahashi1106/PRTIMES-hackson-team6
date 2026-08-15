# PRTIMES Hackathon Team 6

PR TIMES の初回利用者や配信後の改善に迷うユーザーを支援する、ハッカソン用デモプロジェクトです。

## 何が入っているか

- `prtimes_clone/`: PR TIMES 管理画面の React/Vite デモ
- `guide_panel/`: 配信ガイドパネルと管理画面向け API の FastAPI サーバー
- `line_bot/`: LINE Messaging API を使った通知・案内 Bot

## 主な機能

- PR TIMES 管理画面風 UI
- 企業情報、プレスリリース、メディアリスト、ストーリー管理
- プレスリリース作成時のメディア自動推薦
- 配信準備のステップを案内するガイドパネル
- LINE Bot による通知・案内

## 必要なもの

- Node.js
- npm
- Python 3.10 以上
- LINE Bot を使う場合: LINE Developers の Messaging API チャネル
- メディア推薦を使う場合: `OPENAI_API_KEY` と DB 接続情報

## セットアップ

```bash
cd prtimes_clone
npm install
```

`guide_panel/run.sh` と `line_bot/run.sh` は Python 仮想環境 `.webapppr` を自動作成し、`requirements.txt` をインストールします。

必要に応じて、リポジトリ直下に `.env` を作成してください。

```env
DB_HOST=prtimes-hackathon-2026summer-db.cfq2m2o6cvor.ap-northeast-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=prtimes
DB_USER=hackathon
DB_PASSWORD=<password>
OPENAI_API_KEY=<openai-api-key>
LINE_CHANNEL_SECRET=<line-channel-secret>
LINE_CHANNEL_ACCESS_TOKEN=<line-channel-access-token>
```

DB 接続情報がない場合、`guide_panel` はローカル SQLite にフォールバックします。

## 起動方法

### フロントエンド

```bash
cd prtimes_clone
npm run dev
```

`http://localhost:5173` で起動します。

### guide_panel / API

```bash
./guide_panel/run.sh
```

`http://127.0.0.1:8000` で起動します。

### LINE Bot

```bash
./line_bot/run.sh
```

`http://127.0.0.1:8001` で起動します。

LINE Bot をローカルで確認する場合は、別ターミナルでトンネルを起動します。

```bash
./line_bot/dev_tunnel.sh
```

表示された `https://xxxx.trycloudflare.com/webhook` を LINE Developers コンソールの Webhook URL に設定してください。

## 開発用コマンド

```bash
cd prtimes_clone
npm run dev
npm run build
npm run lint
```

API ヘルスチェック:

```bash
curl http://127.0.0.1:8000/api/health
curl http://127.0.0.1:8001/api/health
```

メディア推薦テスト:

```bash
.webapppr/bin/python guide_panel/test_recommendation.py
```

## ドキュメント

- [doc/task_logic.md](doc/task_logic.md): 解く課題
- [doc/modia_list_logic.md](doc/modia_list_logic.md): メディア推薦ロジック
- [doc/backend_api.md](doc/backend_api.md): API 仕様
- [prtimes_clone/README.md](prtimes_clone/README.md): フロントエンド
- [line_bot/README.md](line_bot/README.md): LINE Bot 開発フロー

## 注意点

- `.env` や DB ファイルなどのローカル環境情報はコミットしないでください。
- メディア推薦には `OPENAI_API_KEY` と推薦対象データが必要です。
- 本番反映は GitHub への push / PR マージ後、サーバ側で `git pull` して行います。
