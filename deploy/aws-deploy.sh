#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
VENV_DIR="$PROJECT_DIR/.webapppr"
RUN_DIR="$PROJECT_DIR/.run"
LOG_DIR="$PROJECT_DIR/.logs"

mkdir -p "$RUN_DIR" "$LOG_DIR"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then
	# shellcheck disable=SC1091
	source "$NVM_DIR/nvm.sh"
	nvm use --silent default >/dev/null
fi

if [[ ! -x "$VENV_DIR/bin/python" ]]; then
	python3 -m venv "$VENV_DIR"
fi

"$VENV_DIR/bin/pip" install -r "$PROJECT_DIR/requirements.txt"
npm --prefix "$PROJECT_DIR/prtimes_clone" install

if [[ -f "$RUN_DIR/guide-panel.pid" ]]; then
	old_pid="$(cat "$RUN_DIR/guide-panel.pid")"
	if kill -0 "$old_pid" 2>/dev/null; then
		kill "$old_pid"
		for _ in {1..20}; do
			kill -0 "$old_pid" 2>/dev/null || break
			sleep 0.1
		done
	fi
fi

(
	cd "$PROJECT_DIR/guide_panel"
	nohup "$VENV_DIR/bin/python" -m uvicorn main:app \
		--host 127.0.0.1 --port 8000 --reload \
		>>"$LOG_DIR/guide-panel.log" 2>&1 &
	echo $! > "$RUN_DIR/guide-panel.pid"
)

if ! pgrep -f "$PROJECT_DIR/prtimes_clone/node_modules/.bin/vite" >/dev/null; then
	nohup npm --prefix "$PROJECT_DIR/prtimes_clone" run dev -- --host 0.0.0.0 \
		>>"$LOG_DIR/vite.log" 2>&1 &
fi

# Reload the existing Vite process so the API proxy configuration is applied.
touch "$PROJECT_DIR/prtimes_clone/vite.config.ts"

for _ in {1..30}; do
	if curl --fail --silent http://127.0.0.1:8000/api/health >/dev/null; then
		echo "AWS deployment complete."
		exit 0
	fi
	sleep 1
done

echo "FastAPI did not become healthy. Check $LOG_DIR/guide-panel.log" >&2
exit 1
