# prtimes_clone

PR TIMES 管理画面風の React/Vite デモです。

## 起動

```bash
cd prtimes_clone
npm install
npm run dev
```

デフォルトは `http://localhost:5173` です。

## 主な画面

- ダッシュボード
- 企業設定
- プレスリリース作成・一覧
- メディアリスト作成・一覧
- ストーリー作成・一覧
- 配信ガイド
- 分析レポート

## 開発コマンド

```bash
npm run dev
npm run build
npm run lint
```

## API 接続

API と連携する場合は `.env` に指定します。

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

API 側はリポジトリ直下で `./guide_panel/run.sh` を実行してください。
