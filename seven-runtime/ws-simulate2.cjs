const WebSocket = require('ws');

const PORT = process.env.WS_SIM_PORT || 8090;

// Start WS server
const wss = new WebSocket.Server({ port: PORT }, () => {
  console.log('[SIM2] WS server listening on port', PORT);
});

wss.on('connection', (ws) => {
  console.log('[SIM2] Client connected');
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
    console.log('[SIM2] Broadcasting sample event');
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(msg);
    });
  }, 500);
});

// Start client connecting to the server and wait for the CATTLE_STATE_UPDATED message
const client = new WebSocket(`ws://127.0.0.1:${PORT}`);
let timer = setTimeout(() => { console.error('[SIM2] timed out'); process.exit(2); }, 5000);
client.on('open', () => console.log('[SIM2] Client connected to server'));
client.on('message', (data) => {
  try {
    const msg = JSON.parse(data.toString());
    console.log('[SIM2] Client received:', JSON.stringify(msg));
    if (msg && msg.type === 'CATTLE_STATE_UPDATED') {
      clearTimeout(timer);
      console.log('[SIM2] Success — received CATTLE_STATE_UPDATED');
      process.exit(0);
    } else {
      console.log('[SIM2] Ignoring message type:', msg.type);
    }
  } catch (e) {
    console.error('[SIM2] parse error', e);
  }
});
client.on('error', (err) => { console.error('[SIM2] Client error', err); process.exit(3); });
