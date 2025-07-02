#!/usr/bin/env bash
# Bolt.AGI one-liner bootstrap
# -------------------------------------------------
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/stackblitz-labs/bolt.diy/agi-revolution/scripts/setup.sh | bash
# -------------------------------------------------
set -euo pipefail

MIN_NODE="18.18.0"
command -v node >/dev/null 2>&1 || {
  echo "[ERROR] Node.js $MIN_NODE+ is required. Please install it first." >&2
  exit 1
}

# Compare node versions – fallback to proceed if newer
NODE_VERSION=$(node -p "process.version.slice(1)")
ver() { printf '%03d%03d%03d' $(echo "$1" | tr '.' ' '); }
if [ $(ver "$NODE_VERSION") -lt $(ver "$MIN_NODE") ]; then
  echo "[ERROR] Node >= $MIN_NODE required, found $NODE_VERSION" >&2
  exit 1
fi

echo "▶ Installing pnpm …"
if ! command -v pnpm >/dev/null 2>&1; then
  npm install -g pnpm >/dev/null 2>&1
fi

export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

# Optional global CLIs
pnpm add -g expo-cli eas-cli >/dev/null 2>&1 || true

# Workspace deps
SCRIPT_DIR=$(dirname "$0")
REPO_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
cd "$REPO_ROOT"

echo "▶ Installing workspace dependencies (monorepo) …"
pnpm install

echo "✅ Setup complete! Common next steps:\n  • pnpm run dev             # start web backend\n  • pnpm run mobile:start    # start Expo dev\n  • pnpm run build-apk       # build Android APK (SDK/Docker req.)"