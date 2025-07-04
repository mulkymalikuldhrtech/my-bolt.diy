#!/bin/bash

# Detect environment for optimization
IS_TERMUX=false
IS_LOW_MEMORY=false

if [ -n "$PREFIX" ] && [ -d "$PREFIX" ]; then
    echo "🤖 Termux environment detected"
    IS_TERMUX=true
    IS_LOW_MEMORY=true
fi

# Check available memory (Linux/Android)
if command -v free >/dev/null 2>&1; then
    TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
    if [ "$TOTAL_MEM" -lt 4096 ]; then
        echo "⚠️  Low memory environment detected ($TOTAL_MEM MB)"
        IS_LOW_MEMORY=true
    fi
fi

# Install pnpm with the specific version used by this project
if ! command -v pnpm >/dev/null 2>&1; then
    echo "📦 Installing pnpm@9.4.0..."
    npm install -g pnpm@9.4.0
else
    echo "✅ pnpm already available"
fi

# Install project dependencies
echo "📚 Installing dependencies..."
if [ "$IS_LOW_MEMORY" = true ]; then
    # Use memory-efficient options for low memory environments
    pnpm install --frozen-lockfile --prefer-offline
else
    pnpm install
fi

# Skip build in setup for low memory environments (rely on dev mode)
if [ "$IS_LOW_MEMORY" = true ]; then
    echo "⚡ Skipping build in low memory environment (use 'pnpm run dev' instead)"
    echo "💡 For production build, ensure sufficient memory or use: NODE_OPTIONS='--max-old-space-size=2048' pnpm run build"
else
    echo "🔨 Building project..."
    pnpm run build
fi

echo "✅ Setup completed successfully!"
