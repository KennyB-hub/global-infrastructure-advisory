const WebSocket = require('ws');

const PORT = process.env.WS_SIM_PORT || 8090;

// Start WS server
const wss = new WebSocket.Server({ port: PORT }, () => {
  console.log('[SIM] WS server listening on port', PORT);
});

wss.on('connection', (ws) => {
  console.log('[SIM] Client connected');
  ws.send(JSON.stringify({ type: 'WELCOME', ts: Date.now(), message: 'Simulated collar WS' }));

  // send a sample collar update after short delay
  setTimeout(() => {
    const payload = {
      type: 'CATTLE_STATE_UPDATED',
      collarId: 'sim-collar-001',
      updatedAt: Date.now(),
      gps: { lat: 40.7128, lon: -74.0060 },
      distanceToBoundary: 12.3,
      outsidePasture: false
    };
    const msg = JSON.stringify({ type: 'CATTLE_STATE_UPDATED', payload });
    console.log('[SIM] Broadcasting sample event');
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(msg);
    });
  }, 500);
});

// Start client connecting to the server and print first message
const client = new WebSocket(`ws://127.0.0.1:${PORT}`);
client.on('open', () => console.log('[SIM] Client connected to server'));
client.on('message', (data) => {
  console.log('[SIM] Client received:', data.toString());
  process.exit(0);
});
client.on('error', (err) => { console.error('[SIM] Client error', err); process.exit(2); });
