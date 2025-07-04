#!/bin/bash

# Install pnpm with the specific version used by this project
npm install -g pnpm@9.4.0

# Install project dependencies
pnpm install

# Build the project
pnpm run build
