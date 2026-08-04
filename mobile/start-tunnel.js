#!/usr/bin/env node
/**
 * Starts a localtunnel on port 5001 and prints the Expo Go URL.
 * Called by start-mobile.sh after Metro is up.
 */
const localtunnel = require('localtunnel');

(async () => {
  try {
    const tunnel = await localtunnel({ port: 5001 });

    const host = tunnel.url.replace('https://', '');

    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║          📱  Open in Expo Go on your phone           ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log('║                                                      ║');
    console.log('║  1. Open Expo Go                                     ║');
    console.log('║  2. Tap "Enter URL manually"                         ║');
    console.log('║  3. Enter:                                           ║');
    console.log(`║     exp://${host.padEnd(42)}║`);
    console.log('║                                                      ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');

    tunnel.on('close', () => {
      console.log('[tunnel] closed — restart the workflow to get a new URL');
    });

    tunnel.on('error', (err) => {
      console.error('[tunnel] error:', err.message);
    });

    // Keep process alive
    process.on('SIGTERM', () => { tunnel.close(); process.exit(0); });
    process.on('SIGINT',  () => { tunnel.close(); process.exit(0); });

  } catch (err) {
    console.error('[tunnel] failed to start:', err.message);
    console.error('         Web preview at port 5000 still works in the browser.');
  }
})();
