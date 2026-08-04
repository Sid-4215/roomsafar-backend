#!/usr/bin/env node
/**
 * Starts a Cloudflare Quick Tunnel on port 5001 and prints the public URL.
 * Used by start-mobile.sh to get the tunnel URL BEFORE starting Metro,
 * so that EXPO_PACKAGER_PROXY_URL can be set correctly (no port in bundle URLs).
 *
 * Usage:  node start-tunnel-cloudflare.js
 *   → prints the tunnel URL to stdout once ready, then keeps running
 */
const { spawn } = require('child_process');

const proc = spawn('cloudflared', [
  'tunnel', '--no-autoupdate', '--url', 'http://localhost:5001'
], { stdio: ['ignore', 'pipe', 'pipe'] });

let printed = false;

function handleOutput(data) {
  const text = data.toString();

  // cloudflared prints the URL to stderr:  https://xxxx.trycloudflare.com
  const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
  if (match && !printed) {
    printed = true;
    // Write URL to stdout so the shell script can capture it
    process.stdout.write(match[0] + '\n');
  }
}

proc.stdout.on('data', handleOutput);
proc.stderr.on('data', handleOutput);

proc.on('close', (code) => {
  process.stderr.write(`[cloudflare tunnel] exited (${code})\n`);
});

process.on('SIGTERM', () => { proc.kill(); process.exit(0); });
process.on('SIGINT',  () => { proc.kill(); process.exit(0); });
