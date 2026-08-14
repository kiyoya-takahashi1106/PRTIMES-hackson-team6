# line_bot 開発フロー

本番サーバへは直接デプロイせず、次の3ステップで進める。

## 1. ローカルの変更を LINE で確認する

1. `.env` に `LINE_CHANNEL_SECRET` / `LINE_CHANNEL_ACCESS_TOKEN` を設定する（本番と別チャネルを使う場合はそちらの値に差し替える）
2. ターミナルA: `./line_bot/run.sh` でローカルサーバを起動 (port 8001)
3. ターミナルB: `./line_bot/dev_tunnel.sh` で cloudflared トンネルを起動し、表示された `https://xxxx.trycloudflare.com/webhook` を控える
4. [LINE Developers コンソール](https://developers.line.biz/console/) の対象チャネル → Messaging API → Webhook URL に上記URLを設定し「検証」→ 実際にLINEアプリから話しかけて確認する
5. 確認が終わったらトンネルを閉じ（Ctrl+C）、Webhook URL を本番のものに戻す

## 2. ファイルに変更を加える

`line_bot/` 配下を編集し、1に戻って動作確認する。

## 3. 変更を反映する

本番サーバの更新は手動（サーバ上で `git pull`）で行うため、ここでの作業は GitHub 側の更新のみ。

```
git checkout -b feature/xxx
git add line_bot/...
git commit -m "..."
git push -u origin feature/xxx
```

その後 GitHub 上で Pull Request を作成する。マージ後、サーバ管理者が本番サーバ上で `git pull` して反映する。
