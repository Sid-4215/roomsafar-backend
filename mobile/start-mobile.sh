#!/bin/bash
set -e

cd "$(dirname "$0")"

# Build the backend API URL from Replit's dev domain
# Port 8080 is accessible at 8080-<REPLIT_DEV_DOMAIN> in Replit
if [ -n "$REPLIT_DEV_DOMAIN" ]; then
  BACKEND_URL="https://8080-${REPLIT_DEV_DOMAIN}"
else
  BACKEND_URL="http://localhost:8080"
fi

echo "EXPO_PUBLIC_API_URL=${BACKEND_URL}" > .env
echo "✅ API URL set to: ${BACKEND_URL}"

# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install --legacy-peer-deps
fi

echo "🚀 Starting RoomSafar mobile app (web preview)..."
npx expo start --web --port 5000
