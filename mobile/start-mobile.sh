#!/bin/bash
set -e

cd "$(dirname "$0")"

# With the proxy approach, the app and API are served from the same origin (port 5000).
# No cross-origin requests → no CORS issues in the Replit preview.
echo "EXPO_PUBLIC_API_URL=" > .env
echo "✅ API calls will be proxied through port 5000 → localhost:8080"

# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install --legacy-peer-deps
fi

echo "🚀 Starting Expo Metro on port 5001 (internal)..."
npx expo start --web --port 5001 &
EXPO_PID=$!

# Give Metro a moment to start before accepting proxy traffic
sleep 5

echo "🔀 Starting reverse proxy on port 5000 (public)..."
PROXY_PORT=5000 EXPO_PORT=5001 BACKEND_PORT=8080 node proxy-server.js &
PROXY_PID=$!

echo "✅ App available at port 5000  (proxy → Expo:5001 + Backend:8080)"

cleanup() {
  kill $EXPO_PID $PROXY_PID 2>/dev/null
  exit 0
}
trap cleanup SIGTERM SIGINT

wait
