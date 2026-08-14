#!/bin/bash
# ローカルで動かしている line_bot (run.sh, port 8001) を
# 一時的にインターネットに公開し、LINE の Webhook から確認できるようにする。
#
# 事前準備:
#   - `./line_bot/run.sh` を別のターミナルで起動しておく
#   - `brew install cloudflared` (未インストールの場合)
#
# 使い方:
#   ./line_bot/dev_tunnel.sh
#   -> 表示された https://xxxx.trycloudflare.com/webhook を
#      LINE Developers コンソールの Webhook URL に一時的に設定して「検証」する
#
# 確認が終わったら Ctrl+C でトンネルを終了し、
# Webhook URL を本番のものに戻すのを忘れないこと。

set -e

PORT="${1:-8001}"

if ! command -v cloudflared >/dev/null 2>&1; then
	echo "cloudflared が見つかりません。 'brew install cloudflared' でインストールしてください。" >&2
	exit 1
fi

echo "port ${PORT} をトンネルします。表示される https://xxxx.trycloudflare.com/webhook を"
echo "LINE Developers コンソールの Webhook URL に設定してください。"
echo

exec cloudflared tunnel --url "http://localhost:${PORT}"
