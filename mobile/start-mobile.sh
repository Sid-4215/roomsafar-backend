#!/bin/bash
set -e

cd "$(dirname "$0")"

# ── API URL ────────────────────────────────────────────────────────────────────
if [ -n "$REPLIT_DEV_DOMAIN" ]; then
  API_URL="https://$REPLIT_DEV_DOMAIN"
else
  API_URL="http://localhost:8080"
fi
echo "EXPO_PUBLIC_API_URL=$API_URL" > .env
echo "✅ API URL set to: $API_URL"

# ── Install deps if needed ─────────────────────────────────────────────────────
INSTALLED_EXPO=$(node -e "try{const p=require('./node_modules/expo/package.json');console.log(p.version)}catch(e){console.log('none')}" 2>/dev/null)
EXPECTED_EXPO=$(node -e "const p=require('./package.json');console.log(p.dependencies.expo.replace(/[~^]/,''))" 2>/dev/null)
if [ ! -d "node_modules" ] || [ "$INSTALLED_EXPO" = "none" ] || [[ "$INSTALLED_EXPO" != "$EXPECTED_EXPO"* ]]; then
  echo "📦 Installing dependencies..."
  npm install --legacy-peer-deps
fi

# ── Step 1: Start proxy on port 5000 IMMEDIATELY (prevents workflow timeout) ──
echo "🔀 Starting reverse proxy on port 5000..."
PROXY_PORT=5000 EXPO_PORT=5001 BACKEND_PORT=8080 node proxy-server.js &
PROXY_PID=$!

# ── Step 2: Start Cloudflare tunnel in background, capture URL ─────────────────
echo "🌐 Starting Cloudflare tunnel..."
rm -f /tmp/cf-tunnel-url.txt
node start-tunnel-cloudflare.js > /tmp/cf-tunnel-url.txt 2>/dev/null &
TUNNEL_PID=$!

# Wait up to 45s for cloudflared to print its URL
TUNNEL_URL=""
for i in $(seq 1 45); do
  if [ -s /tmp/cf-tunnel-url.txt ]; then
    TUNNEL_URL=$(head -1 /tmp/cf-tunnel-url.txt | tr -d '[:space:]')
    break
  fi
  sleep 1
done

if [ -z "$TUNNEL_URL" ]; then
  echo "⚠️  Cloudflare tunnel did not start in time — native Expo Go will not work"
  echo "   Web preview at port 5000 still works."
  rm -f qr-b64.txt
else
  # Generate QR code as base64 data URL for /phone-preview page
  node -e "
    const QRCode = require('qrcode');
    const url = 'exp://' + '$TUNNEL_URL'.replace('https://', '');
    QRCode.toDataURL(url, { width: 300 }, (err, data) => {
      if (!err) { process.stdout.write(data); }
    });
  " > qr-b64.txt 2>/dev/null || rm -f qr-b64.txt
fi

# ── Step 3: Start Metro with EXPO_PACKAGER_PROXY_URL set to tunnel URL ─────────
# This ensures bundle URLs in the manifest use the public tunnel domain (no :5001)
echo "🚀 Starting Expo Metro on port 5001..."
if [ -n "$TUNNEL_URL" ]; then
  EXPO_NO_TELEMETRY=1 BROWSER=none EXPO_PACKAGER_PROXY_URL="$TUNNEL_URL" \
    npx expo start --port 5001 &
else
  EXPO_NO_TELEMETRY=1 BROWSER=none npx expo start --port 5001 &
fi
EXPO_PID=$!

# ── Step 4: Print Expo Go instructions ─────────────────────────────────────────
if [ -n "$TUNNEL_URL" ]; then
  HOST=$(echo "$TUNNEL_URL" | sed 's|https://||')
  EXPO_GO_URL="exp://$HOST"
  sleep 5
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║           📱  Open in Expo Go on your phone                 ║"
  echo "╠══════════════════════════════════════════════════════════════╣"
  echo "║                                                              ║"
  echo "║  Enter this URL manually in Expo Go:                        ║"
  printf "║    %-58s║\n" "$EXPO_GO_URL"
  echo "║                                                              ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
fi

cleanup() {
  kill $PROXY_PID $TUNNEL_PID $EXPO_PID 2>/dev/null
  exit 0
}
trap cleanup SIGTERM SIGINT

wait
