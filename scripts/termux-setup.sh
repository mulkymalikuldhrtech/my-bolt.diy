#!/data/data/com.termux/files/usr/bin/bash
# Bolt.AGI Termux bootstrap script
# --------------------------------------------------
# This script installs all required build tooling and global CLIs
# to run the Bolt.AGI monorepo (web backend, electron, mobile).
# Usage:
#   pkg update -y && pkg upgrade -y
#   curl -fsSL https://raw.githubusercontent.com/stackblitz-labs/bolt.diy/agi-revolution/scripts/termux-setup.sh | bash
# --------------------------------------------------

set -euo pipefail

# 1. Core packages
pkg install -y git nodejs-lts wget curl python clang openssl zip unzip

# 2. pnpm package manager
if ! command -v pnpm >/dev/null 2>&1; then
  echo "Installing pnpm..."
  curl -fsSL https://get.pnpm.io/install.sh | bash -
  export PNPM_HOME="$HOME/.local/share/pnpm"
  export PATH="$PNPM_HOME:$PATH"
  echo 'export PNPM_HOME="$HOME/.local/share/pnpm"' >> "$HOME/.bashrc"
  echo 'export PATH="$PNPM_HOME:$PATH"' >> "$HOME/.bashrc"
fi

# 3. Expo & EAS CLI (for mobile builds)
pnpm add -g expo-cli eas-cli

# 4. Husky Git hooks require patch-package
pnpm add -g patch-package

# 5. Verify
node -v
git --version
pnpm -v
echo "✅ Termux environment ready. Clone repo and run 'pnpm install' next."