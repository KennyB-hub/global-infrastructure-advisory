// Launcher to run the NATS-backed collar WS bridge as a separate process
// Usage: node run-collar-ws.js

process.title = 'collar-ws-nats-runner';

try {
  const bridge = require('./collar-ws-nats.js');
  const startFn = bridge?.startNatsWsBridge || bridge?.start || (bridge?.default && bridge.default.start);
  if (!startFn) {
    console.error('No start function exported from collar-ws-nats.js');
    process.exit(1);
  }

  startFn().catch(err => {
    console.error('collar-ws-nats failed:', err);
    process.exit(1);
  });
} catch (e) {
  console.error('Failed to require collar-ws-nats:', e);
  process.exit(1);
}
