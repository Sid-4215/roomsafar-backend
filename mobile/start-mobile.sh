#!/bin/bash
set -e

cd "$(dirname "$0")"

# Set the API URL to the Replit dev domain so both web and native devices
# can reach the backend. Relative URLs don't work in native (Expo Go).
if [ -n "$REPLIT_DEV_DOMAIN" ]; then
  API_URL="https://$REPLIT_DEV_DOMAIN"
else
  API_URL="http://localhost:8080"
fi

echo "EXPO_PUBLIC_API_URL=$API_URL" > .env
echo "✅ API URL set to: $API_URL"

# Install dependencies if node_modules is missing or expo version mismatch
INSTALLED_EXPO=$(node -e "try{const p=require('./node_modules/expo/package.json');console.log(p.version)}catch(e){console.log('none')}" 2>/dev/null)
EXPECTED_EXPO=$(node -e "const p=require('./package.json');console.log(p.dependencies.expo.replace(/[~^]/,''))" 2>/dev/null)
if [ ! -d "node_modules" ] || [ "$INSTALLED_EXPO" = "none" ] || [[ "$INSTALLED_EXPO" != "$EXPECTED_EXPO"* ]]; then
  echo "📦 Installing dependencies (SDK 54)..."
  npm install --legacy-peer-deps
fi

echo "🚀 Starting Expo Metro on port 5001 (tunnel + web mode)..."
EXPO_NO_TELEMETRY=1 BROWSER=none npx expo start --port 5001 --tunnel &
EXPO_PID=$!

# Give Metro time to start before proxy comes up
sleep 6

echo "🔀 Starting reverse proxy on port 5000 (public web entry point)..."
PROXY_PORT=5000 EXPO_PORT=5001 BACKEND_PORT=8080 node proxy-server.js &
PROXY_PID=$!

echo "✅ App available at port 5000  (proxy → Expo:5001 + Backend:8080)"

cleanup() {
  kill $EXPO_PID $PROXY_PID 2>/dev/null
  exit 0
}
trap cleanup SIGTERM SIGINT

wait
