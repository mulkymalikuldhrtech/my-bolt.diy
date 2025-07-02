#!/usr/bin/env bash
set -euo pipefail

echo "📦 Building Android APK locally via EAS ..."

pnpm install --filter mobile

pnpm mobile:build:local

echo "✅ APK generated at release/android/ex-machina-mobile.apk"