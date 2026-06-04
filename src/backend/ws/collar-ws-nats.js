// Tiny NATS-backed WebSocket push server for collar updates
// Usage: npm install ws nats
// Run: node collar-ws-nats.js

const { connect, StringCodec } = require('nats');
const WebSocket = require('ws');

const WS_PORT = process.env.WS_PORT || 8081;
const NATS_URL = process.env.NATS_URL || process.env.NATS_SERVER || 'nats://127.0.0.1:4222';

async function start() {
  const sc = StringCodec();
  const nc = await connect({ servers: NATS_URL });
  console.log('Connected to NATS at', NATS_URL);

  const wss = new WebSocket.Server({ port: WS_PORT });
  console.log('WebSocket server listening on', WS_PORT);

  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'WELCOME', payload: { message: 'Connected to collar NATS bridge' } }));

    ws.on('message', (msg) => {
      try {
        const parsed = JSON.parse(msg);
        if (parsed && parsed.action === 'ping') ws.send(JSON.stringify({ type: 'PONG' }));
      } catch (e) {
        // ignore non-json
      }
    });
  });

  // Subscribe broadly to Seven event subjects. Filter for CATTLE_STATE_UPDATED
  const subjSub = nc.subscribe('seven.events.>');
  (async () => {
    for await (const m of subjSub) {
      let payload = null;
      try {
        const raw = sc.decode(m.data);
        payload = JSON.parse(raw);
      } catch (e) {
        // not JSON, skip
        continue;
      }

      // Determine event type — prefer explicit field, else infer from subject
      const eventType = (payload && payload.type) || (m.subject && m.subject.split('.').pop());
      if (eventType !== 'CATTLE_STATE_UPDATED') continue;

      const message = JSON.stringify({ type: 'CATTLE_STATE_UPDATED', subject: m.subject, payload });

      // Broadcast to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  })().catch((err) => console.error('NATS subscription error', err));

  // Graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down NATS-WS bridge');
    try { await nc.drain(); } catch (e) { nc.close(); }
    wss.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = { startNatsWsBridge: start };

if (require.main === module) {
  start().catch((err) => {
    console.error('Failed to start collar-ws-nats:', err);
    process.exit(1);
  });
}

