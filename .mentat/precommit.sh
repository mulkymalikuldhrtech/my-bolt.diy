#!/bin/bash

# Detect environment for optimization
IS_TERMUX=false
IS_LOW_MEMORY=false

if [ -n "$PREFIX" ] && [ -d "$PREFIX" ]; then
    IS_TERMUX=true
    IS_LOW_MEMORY=true
fi

# Check available memory (Linux/Android)
if command -v free >/dev/null 2>&1; then
    TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
    if [ "$TOTAL_MEM" -lt 4096 ]; then
        IS_LOW_MEMORY=true
    fi
fi

# Ensure pnpm is available
if ! command -v pnpm >/dev/null 2>&1; then
    echo "📦 Installing pnpm@9.4.0..."
    npm install -g pnpm@9.4.0
fi

# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "📚 Installing dependencies..."
    if [ "$IS_LOW_MEMORY" = true ]; then
        # Use memory-efficient options for low memory environments
        pnpm install --frozen-lockfile --prefer-offline
    else
        pnpm install
    fi
fi

# Run ESLint with fix and Prettier formatting
echo "🔧 Running linting and formatting..."
if [ "$IS_LOW_MEMORY" = true ]; then
    # Limit Node.js memory usage in low memory environments
    NODE_OPTIONS="--max-old-space-size=1024" pnpm run lint:fix
else
    pnpm run lint:fix
fi

echo "✅ Code formatting completed!"

# Note: Skipping typecheck in precommit as it requires a full build
# which is too heavy for precommit. TypeScript checking is handled in CI.
# For manual typecheck in Termux: NODE_OPTIONS='--max-old-space-size=2048' pnpm run typecheck
