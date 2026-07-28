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

# Install dependencies if node_modules is missing or react-native-worklets is missing
if [ ! -d "node_modules" ] || [ ! -d "node_modules/react-native-worklets" ]; then
  echo "📦 Installing dependencies..."
  npm install --legacy-peer-deps
fi

echo "🚀 Starting Expo Metro on port 5001 with tunnel (for Expo Go)..."
# --tunnel creates an ngrok public URL so Expo Go on any device can scan the QR.
# @expo/ngrok is listed in package.json so this works without extra installs.
EXPO_NO_TELEMETRY=1 BROWSER=none npx expo start --port 5001 --web --tunnel &
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
