#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
VENV_DIR="$PROJECT_DIR/.webapppr"

if [[ ! -x "$VENV_DIR/bin/python" ]]; then
	python3 -m venv "$VENV_DIR"
	"$VENV_DIR/bin/pip" install -r "$PROJECT_DIR/requirements.txt"
fi

cd "$SCRIPT_DIR"
exec "$VENV_DIR/bin/python" -m uvicorn main:app --reload
