#!/usr/bin/env node
/**
 * Simple reverse proxy for Replit.
 *
 * Runs on PORT (default 5000, the externally-visible port).
 * - /auth/**, /api/**  → forwarded to BACKEND (localhost:8080)
 * - everything else    → forwarded to Expo Metro (localhost:5001)
 *
 * This lets the browser talk to one origin for both the app and the API,
 * completely eliminating CORS issues in the Replit preview.
 *
 * The Origin header is stripped before forwarding to Metro so that
 * Expo's CorsMiddleware does not reject the hot-reload WebSocket.
 */

const http = require('http');
const httpProxy = require('http-proxy');

const PORT    = parseInt(process.env.PROXY_PORT   || '5000', 10);
const EXPO    = parseInt(process.env.EXPO_PORT    || '5001', 10);
const BACKEND = parseInt(process.env.BACKEND_PORT || '8080', 10);

const proxy = httpProxy.createProxyServer({ ws: true });

proxy.on('error', (err, req, res) => {
  console.error('[proxy] error:', err.message);
  // res may be a net.Socket (for WS errors) or an http.ServerResponse
  if (res && typeof res.writeHead === 'function' && !res.headersSent) {
    try {
      res.writeHead(502);
      res.end('Bad Gateway');
    } catch (_) { /* ignore */ }
  } else if (res && typeof res.destroy === 'function') {
    try { res.destroy(); } catch (_) { /* ignore */ }
  }
});

const server = http.createServer((req, res) => {
  const path = req.url || '/';
  const isApi = path.startsWith('/api/') || path.startsWith('/auth/');

  if (isApi) {
    proxy.web(req, res, { target: `http://localhost:${BACKEND}`, changeOrigin: true });
  } else {
    // Strip Origin so Expo Metro's CorsMiddleware doesn't reject the request
    delete req.headers['origin'];
    proxy.web(req, res, { target: `http://localhost:${EXPO}`, changeOrigin: true });
  }
});

// Forward WebSocket connections (Metro hot-reload)
server.on('upgrade', (req, socket, head) => {
  // Strip Origin for Metro WebSocket upgrades too
  delete req.headers['origin'];
  proxy.ws(req, socket, head, { target: `http://localhost:${EXPO}`, changeOrigin: true });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[proxy] listening on :${PORT}`);
  console.log(`[proxy] API  → localhost:${BACKEND}`);
  console.log(`[proxy] App  → localhost:${EXPO}`);
});
