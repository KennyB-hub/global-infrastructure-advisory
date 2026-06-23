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

  // Optional Redis client for state persistence (used by test HTTP endpoint and fallback)
  let redis = null;
  const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  try {
    const IORedis = require('ioredis');
    redis = new IORedis(REDIS_URL);
    console.log('Connected to Redis at', REDIS_URL);
  } catch (e) {
    console.warn('Redis not available or ioredis not installed; Redis features disabled');
    redis = null;
  }

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
    try { await nc.drain(); } catch (e) { try { nc.close(); } catch(_){} }
    try { wss.close(); } catch(_){}
    if (httpServer) {
      try { httpServer.close(); } catch(_){}
    }
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // --- Test HTTP endpoint (POST /__test/event) ---
  // Allows sending a JSON event to the WS bridge for testing without NATS
  const http = require('http');
  const TEST_HTTP_PORT = process.env.TEST_HTTP_PORT || (Number(WS_PORT) + 1);
  let httpServer = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/__test/event') {
      try {
        let body = '';
        for await (const chunk of req) body += chunk;
        const obj = JSON.parse(body || '{}');

        // If client sent full envelope use it, else wrap
        const envelope = (obj && obj.type) ? obj : { type: obj.type || 'CATTLE_STATE_UPDATED', payload: obj };

        // Optionally publish to NATS for parity
        try {
          if (nc && nc.publish && envelope && envelope.type) {
            const subject = `seven.events.cattle.${envelope.type}`;
            nc.publish(subject, sc.encode(JSON.stringify(envelope)));
          }
        } catch (e) {
          // ignore publish errors
        }

        // Persist to Redis (if available) so Redis-backed clients / fallback can pick it up
        try {
          const payloadObj = envelope.payload || envelope;
          const id = payloadObj.collarId || payloadObj.animalId || (`unknown_${Date.now()}`);
          const updatedAt = payloadObj.updatedAt || payloadObj.lastSeen || Date.now();
          if (redis) {
            const key = `collar:state:${id}`;
            await redis.set(key, JSON.stringify(payloadObj), 'EX', 60 * 60 * 24 * 7);
            await redis.zadd('collar:latest', updatedAt, id);
          }
        } catch (e) {
          console.error('Redis write error:', e);
        }

        // Broadcast to connected WS clients
        const message = JSON.stringify({ type: envelope.type, payload: envelope.payload || envelope });
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) client.send(message);
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, sentToClients: wss.clients.size }));
      } catch (err) {
        console.error('Error handling /__test/event:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'bad_request' }));
      }
      return;
    }

    // default
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'not_found' }));
  });

  httpServer.listen(TEST_HTTP_PORT, () => {
    console.log(`NATS-WS bridge test HTTP endpoint listening on http://0.0.0.0:${TEST_HTTP_PORT}/__test/event`);
  });
}

module.exports = { startNatsWsBridge: start };

if (require.main === module) {
  start().catch((err) => {
    console.error('Failed to start collar-ws-nats:', err);
    process.exit(1);
  });
}

