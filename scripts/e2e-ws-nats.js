const WebSocket = require('ws');
const { connect, StringCodec } = require('nats');

const WS_URL = process.env.WS_URL || 'ws://127.0.0.1:8081';
const NATS_URL = process.env.NATS_URL || 'nats://127.0.0.1:4222';

async function run() {
  console.log('E2E: connecting to WS', WS_URL);
  const ws = new WebSocket(WS_URL);

  ws.on('open', async () => {
    console.log('E2E: WS open — connecting to NATS', NATS_URL);
    const nc = await connect({ servers: NATS_URL });
    const sc = StringCodec();

    const payload = {
      type: 'CATTLE_STATE_UPDATED',
      collarId: 'test-collar-123',
      updatedAt: Date.now(),
      gps: { lat: 37.7749, lon: -122.4194 },
      distanceToBoundary: 0,
      outsidePasture: false
    };

    const subj = 'seven.events.cattle.CATTLE_STATE_UPDATED';
    console.log('E2E: publishing to NATS subject', subj);
    nc.publish(subj, sc.encode(JSON.stringify(payload)));
    await nc.flush();
    console.log('E2E: published');

    // Wait for incoming WS message
    const timeout = setTimeout(() => {
      console.error('E2E: timed out waiting for WS message');
      process.exit(2);
    }, 8000);

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        console.log('E2E: WS received:', JSON.stringify(msg, null, 2));
        clearTimeout(timeout);
        process.exit(0);
      } catch (e) {
        console.error('E2E: invalid ws payload', e);
        process.exit(3);
      }
    });
  });

  ws.on('error', (err) => {
    console.error('E2E: WS error', err);
    process.exit(4);
  });
}

run().catch(err => { console.error('E2E failed', err); process.exit(1); });
