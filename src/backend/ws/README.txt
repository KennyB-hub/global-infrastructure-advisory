This folder contains WebSocket bridge servers for runtime event streaming.
Files:
 - collar-ws.js : NATS/Redis -> WebSocket bridge for collar updates

Run:
  npm install ws ioredis
  node src/backend/ws/collar-ws.js

Env:
  REDIS_URL (default redis://127.0.0.1:6379)
  WS_PORT (default 8081)
