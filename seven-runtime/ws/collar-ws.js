import { WebSocketServer } from 'ws';
import Redis from 'ioredis';

(async function main(){
  const WS_PORT = process.env.WS_PORT || 8081;
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  // Start WebSocket server
  const wss = new WebSocketServer({ port: WS_PORT });
  console.log(`[WS] Collar WebSocket bridge listening on ws://0.0.0.0:${WS_PORT}`);

  // Redis client for fallback polling (also used for initial state fetch)
  const redis = new Redis(redisUrl);

  // Track last updatedAt per collar to avoid duplicate broadcasts
  const lastUpdated = new Map();

  // Broadcast helper
  function broadcast(message) {
    const payload = typeof message === 'string' ? message : JSON.stringify(message);
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        try { client.send(payload); } catch (e) { /* ignore send errors */ }
      }
    });
  }

  // Try to wire into local EventBus (preferred) if available
  let usingEventBus = false;
  try {
    const eb = await import('../../ai/engines/autonomous/event-bus.js');
    if (eb && typeof eb.getEventBus === 'function') {
      const eventBus = eb.getEventBus();
      // Register a handler for runtime events — NATS events will be routed here by EventBus
      const handler = {
        id: 'ws-collar-broadcast',
        event: 'CATTLE_STATE_UPDATED',
        priority: 50,
        handler: async (event) => {
          try {
            const payload = event.payload || event;
            // Update lastUpdated map
            const id = payload.collarId || payload.animalId || (`unknown_${Date.now()}`);
            const updatedAt = payload.updatedAt || payload.lastSeen || Date.now();
            lastUpdated.set(id, updatedAt);
            broadcast({ type: 'CATTLE_STATE_UPDATED', payload });
          } catch (err) {
            console.error('[WS] EventBus handler error:', err);
          }
        }
      };
      eventBus.registerHandler('CATTLE_STATE_UPDATED', handler);
      usingEventBus = true;
      console.log('[WS] Registered handler with EventBus for CATTLE_STATE_UPDATED');
    }
  } catch (err) {
    console.log('[WS] EventBus not available or registration failed — will use Redis polling fallback');
  }

  // Redis polling fallback (runs regardless to provide initial state and resilience)
  async function pollRedis() {
    try {
      const ids = await redis.zrevrange('collar:latest', 0, 99);
      if (!ids || ids.length === 0) return;
      const keys = ids.map(id => `collar:state:${id}`);
      const pipeline = redis.pipeline();
      keys.forEach(k => pipeline.get(k));
      const results = await pipeline.exec();
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const [err, raw] = results[i];
        if (err || !raw) continue;
        let obj;
        try { obj = JSON.parse(raw); } catch (e) { obj = { collarId: id, raw }; }
        const updatedAt = obj.updatedAt || obj.lastSeen || Date.now();
        const last = lastUpdated.get(id) || 0;
        if (updatedAt > last) {
          lastUpdated.set(id, updatedAt);
          broadcast({ type: 'CATTLE_STATE_UPDATED', payload: obj });
        }
      }
    } catch (err) {
      console.error('[WS] Redis poll error:', err);
    }
  }

  // Poll Redis every 2s for updates (gives real-time feel if EventBus not wired)
  setInterval(pollRedis, 2000);

  // Also run an initial poll on startup
  await pollRedis();

  // Simple ping handler for clients
  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'WELCOME', ts: Date.now(), message: 'Collar WS bridge connected' }));
    ws.on('message', (msg) => {
      // clients can send { action: 'ping' } or request latest
      try {
        const data = JSON.parse(msg.toString());
        if (data && data.action === 'list') {
          // return last 50 collars
          (async () => {
            const ids = await redis.zrevrange('collar:latest', 0, 49);
            const keys = ids.map(id => `collar:state:${id}`);
            const pipeline = redis.pipeline();
            keys.forEach(k => pipeline.get(k));
            const results = await pipeline.exec();
            const collars = results.map(([e, v], i) => { try { return JSON.parse(v); } catch (ex) { return { collarId: ids[i], raw: v }; } }).filter(Boolean);
            ws.send(JSON.stringify({ type: 'COLLAR_LIST', collars }));
          })();
        }
      } catch (e) {
        // ignore
      }
    });
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('[WS] Shutting down');
    try { await redis.quit(); } catch (e) {}
    try { wss.close(); } catch (e) {}
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})();
