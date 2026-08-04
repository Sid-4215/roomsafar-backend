#!/usr/bin/env node
/**
 * Starts a Cloudflare Quick Tunnel on port 5001 and prints the Expo Go URL.
 * Cloudflare tunnels have no interstitial — Expo Go can connect directly.
 */
const { spawn } = require('child_process');

const proc = spawn('cloudflared', [
  'tunnel', '--no-autoupdate', '--url', 'http://localhost:5001'
], { stdio: ['ignore', 'pipe', 'pipe'] });

let printed = false;

function handleOutput(data) {
  const text = data.toString();

  // cloudflared prints the tunnel URL to stderr like:
  //   https://xxxx.trycloudflare.com
  const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
  if (match && !printed) {
    printed = true;
    const host = match[0].replace('https://', '');
    const expoUrl = `exp://${host}`;

    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║           📱  Open in Expo Go on your phone                 ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║                                                              ║');
    console.log('║  Option A — Enter URL manually in Expo Go:                  ║');
    console.log(`║    ${expoUrl.padEnd(58)}║`);
    console.log('║                                                              ║');
    console.log('║  Option B — Generate QR code and scan with Expo Go:         ║');
    console.log(`║    npx qrcode-terminal "${expoUrl}"`.padEnd(64) + '║');
    console.log('║                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
  }
}

proc.stdout.on('data', handleOutput);
proc.stderr.on('data', handleOutput);

proc.on('close', (code) => {
  console.log(`[cloudflare tunnel] exited (${code}) — restart workflow to get a new URL`);
});

process.on('SIGTERM', () => { proc.kill(); process.exit(0); });
process.on('SIGINT',  () => { proc.kill(); process.exit(0); });
