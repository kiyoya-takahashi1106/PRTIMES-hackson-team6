#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
HOOK_PATH="$PROJECT_DIR/.git/hooks/post-merge"

cat > "$HOOK_PATH" <<EOF
#!/bin/bash
set -e
"$PROJECT_DIR/deploy/aws-deploy.sh"
EOF

chmod +x "$HOOK_PATH" "$PROJECT_DIR/deploy/aws-deploy.sh"
"$PROJECT_DIR/deploy/aws-deploy.sh"

echo "Installed post-merge hook. Future git pull operations deploy automatically."
