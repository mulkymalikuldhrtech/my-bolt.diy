#!/bin/bash

# Ensure pnpm is available
if ! command -v pnpm >/dev/null 2>&1; then
    echo "Installing pnpm..."
    npm install -g pnpm@9.4.0
fi

# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install
fi

# Run ESLint with fix and Prettier formatting
pnpm run lint:fix

# Note: Skipping typecheck in precommit as it requires a full build
# which is too heavy for precommit. TypeScript checking is handled in CI.
