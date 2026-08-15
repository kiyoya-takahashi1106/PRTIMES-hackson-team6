# line_bot 開発フロー

LINE Messaging API を使った Bot です。
本番サーバへは直接デプロイせず、ローカル確認後に GitHub 経由で反映します。

## ローカル確認

1. リポジトリ直下の `.env` に `LINE_CHANNEL_SECRET` / `LINE_CHANNEL_ACCESS_TOKEN` を設定する
2. `./line_bot/run.sh` でローカルサーバを起動する
3. 別ターミナルで `./line_bot/dev_tunnel.sh` を起動する
4. 表示された `https://xxxx.trycloudflare.com/webhook` を LINE Developers の Webhook URL に設定する
5. LINE アプリから話しかけて動作確認する

確認後はトンネルを止め、Webhook URL を本番のものに戻してください。

## 主要ファイル

- `line_bot/main.py`: FastAPI アプリと Webhook
- `line_bot/db.py`: DB 接続
- `line_bot/models.py`: データモデル
- `line_bot/seed.py`: 初期データ
- `line_bot/setup_rich_menu.py`: リッチメニュー設定

## 反映手順

```bash
git checkout -b feature/xxx
git add line_bot/...
git commit -m "..."
git push -u origin feature/xxx
```

Pull Request を作成し、マージ後にサーバ側で `git pull` して反映します。
