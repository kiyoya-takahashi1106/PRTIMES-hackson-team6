#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
VENV_DIR="$PROJECT_DIR/.webapppr"

# line-bot-sdk's dependencies need Python >= 3.10.
PYTHON_BIN="$(command -v python3.10 || command -v python3.11 || command -v python3.12 || echo /Library/Frameworks/Python.framework/Versions/3.10/bin/python3.10)"

if [[ ! -x "$VENV_DIR/bin/python" ]]; then
	"$PYTHON_BIN" -m venv "$VENV_DIR"
fi
"$VENV_DIR/bin/pip" install -q -r "$PROJECT_DIR/requirements.txt"

cd "$SCRIPT_DIR"
exec "$VENV_DIR/bin/python" -m uvicorn main:app --reload --port 8001
