#!/usr/bin/env node
/**
 * Simple reverse proxy for Replit.
 *
 * Runs on PORT (default 5000, the externally-visible port).
 * - /phone-preview     → serves an iPhone mockup page with QR code
 * - /auth/**, /api/**  → forwarded to BACKEND (localhost:8080)
 * - everything else    → forwarded to Expo Metro (localhost:5001)
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const httpProxy = require('http-proxy');

const PORT    = parseInt(process.env.PROXY_PORT   || '5000', 10);
const EXPO    = parseInt(process.env.EXPO_PORT    || '5001', 10);
const BACKEND = parseInt(process.env.BACKEND_PORT || '8080', 10);

const proxy = httpProxy.createProxyServer({ ws: true });

proxy.on('error', (err, req, res) => {
  console.error('[proxy] error:', err.message);
  if (res && typeof res.writeHead === 'function' && !res.headersSent) {
    try { res.writeHead(502); res.end('Bad Gateway'); } catch (_) {}
  } else if (res && typeof res.destroy === 'function') {
    try { res.destroy(); } catch (_) {}
  }
});

// Read QR code base64 (generated at startup by start-mobile.sh or on first request)
function getQrDataUrl() {
  try {
    const p = path.join(__dirname, 'qr-b64.txt');
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8').trim();
  } catch (_) {}
  return null;
}

function phonePreviewHtml() {
  const qrDataUrl = getQrDataUrl();
  const qrSection = qrDataUrl
    ? `<div class="qr-card"><img src="${qrDataUrl}" alt="Expo Go QR Code"/></div>`
    : `<div class="qr-card" style="background:#f0f0f0;width:200px;height:200px;display:flex;align-items:center;justify-content:center;color:#666;font-size:13px;border-radius:16px;">QR not ready yet</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>RoomSafar – Phone Preview</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{
    background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);
    display:flex;align-items:center;justify-content:center;
    gap:56px;min-height:100vh;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    padding:40px;
  }
  .iphone{
    position:relative;width:310px;height:640px;
    background:#1c1c1e;border-radius:52px;flex-shrink:0;
    box-shadow:0 0 0 2px #3a3a3c,0 0 0 8px #1c1c1e,0 0 0 10px #3a3a3c,0 40px 80px rgba(0,0,0,.6);
  }
  .iphone::before{
    content:'';position:absolute;left:-10px;top:120px;
    width:4px;height:34px;background:#3a3a3c;border-radius:2px 0 0 2px;
    box-shadow:0 48px 0 #3a3a3c,0 96px 0 #3a3a3c;
  }
  .iphone::after{
    content:'';position:absolute;right:-10px;top:158px;
    width:4px;height:58px;background:#3a3a3c;border-radius:0 2px 2px 0;
  }
  .screen{
    position:absolute;top:12px;left:12px;right:12px;bottom:12px;
    border-radius:42px;overflow:hidden;background:#000;
  }
  .island{
    position:absolute;top:13px;left:50%;transform:translateX(-50%);
    width:104px;height:30px;background:#000;border-radius:18px;z-index:10;
  }
  iframe{width:100%;height:100%;border:none;}
  .panel{display:flex;flex-direction:column;align-items:center;gap:22px;color:#fff;}
  .panel h1{font-size:26px;font-weight:700;letter-spacing:-.5px;}
  .panel p{font-size:13px;color:#a0aec0;text-align:center;max-width:260px;line-height:1.65;}
  .qr-card{background:#fff;border-radius:18px;padding:18px;box-shadow:0 20px 60px rgba(0,0,0,.4);}
  .qr-card img{width:200px;height:200px;display:block;}
  .badge{
    background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);
    border-radius:12px;padding:10px 18px;font-size:12px;color:#cbd5e0;
    text-align:center;max-width:280px;word-break:break-all;
  }
  .badge strong{color:#fff;display:block;margin-bottom:4px;font-size:13px;word-break:normal;}
  .steps{list-style:none;display:flex;flex-direction:column;gap:10px;width:100%;max-width:280px;}
  .steps li{display:flex;align-items:center;gap:12px;font-size:13px;color:#a0aec0;}
  .num{width:24px;height:24px;background:#4a90e2;border-radius:50%;
       display:flex;align-items:center;justify-content:center;
       color:#fff;font-weight:700;font-size:11px;flex-shrink:0;}
  strong.w{color:#fff;}
</style>
</head>
<body>
  <div class="iphone">
    <div class="screen">
      <div class="island"></div>
      <iframe src="/" title="RoomSafar App"></iframe>
    </div>
  </div>
  <div class="panel">
    <h1>🏠 RoomSafar</h1>
    <p>Scan with <strong class="w">Expo Go</strong> on your phone to preview the native app live</p>
    ${qrSection}
    <div class="badge">
      <strong>Expo Go tunnel URL</strong>
      exp://tr-mcfs-anonymous-5001.exp.direct
    </div>
    <ul class="steps">
      <li><span class="num">1</span> Install <strong class="w">Expo Go</strong> from App Store / Play Store</li>
      <li><span class="num">2</span> Open Expo Go → tap <strong class="w">Scan QR code</strong></li>
      <li><span class="num">3</span> The live app loads instantly on your phone</li>
    </ul>
  </div>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0];

  if (urlPath === '/phone-preview') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(phonePreviewHtml());
    return;
  }

  const isApi = urlPath.startsWith('/api/') || urlPath.startsWith('/auth/');
  if (isApi) {
    proxy.web(req, res, { target: `http://localhost:${BACKEND}`, changeOrigin: true });
  } else {
    delete req.headers['origin'];
    proxy.web(req, res, { target: `http://localhost:${EXPO}`, changeOrigin: true });
  }
});

server.on('upgrade', (req, socket, head) => {
  delete req.headers['origin'];
  proxy.ws(req, socket, head, { target: `http://localhost:${EXPO}`, changeOrigin: true });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[proxy] listening on :${PORT}`);
  console.log(`[proxy] API  → localhost:${BACKEND}`);
  console.log(`[proxy] App  → localhost:${EXPO}`);
});
