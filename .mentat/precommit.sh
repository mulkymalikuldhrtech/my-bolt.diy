#!/bin/bash

# Ensure pnpm is available
if ! command -v pnpm >/dev/null 2>&1; then
    echo "Installing pnpm..."
    npm install -g pnpm@9.4.0
fi

# Run ESLint with fix and Prettier formatting
pnpm run lint:fix

# Run TypeScript type checking
pnpm run typecheck
