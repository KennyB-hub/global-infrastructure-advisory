import { DroneControl } from './drone-control';
import { createCircularGeofence } from './geofence';

describe('DroneControl pre-arm safety checks', () => {
  test('arms when telemetry ok and battery sufficient', async () => {
    const d = new DroneControl('mavlink');
    await d.initializeSDK();
    await d.connect();
    d.handleIncomingTelemetry({ lat: 1, lon: 1, alt: 10, heading: 0, speed: 0, battery: 50, timestamp: Date.now() });
    const res = await d.arm();
    expect(res).toBe(true);
  });

  test('blocks arm when battery low', async () => {
    const d = new DroneControl('mavlink');
    await d.initializeSDK();
    await d.connect();
    d.handleIncomingTelemetry({ lat: 1, lon: 1, alt: 10, heading: 0, speed: 0, battery: 20, timestamp: Date.now() });
    const res = await d.arm();
    expect(res).toBe(false);
  });

  test('geofence blocks when outside', async () => {
    const d = new DroneControl('mavlink');
    await d.connect();
    const gf = createCircularGeofence(0, 0, 1000); // 1km radius
    d.setGeofence(gf);
    d.handleIncomingTelemetry({ lat: 0.1, lon: 0.1, alt: 10, heading: 0, speed: 0, battery: 50, timestamp: Date.now() });
    const res = await d.arm();
    expect(res).toBe(false);
  });

  test('geofence allows when inside', async () => {
    const d = new DroneControl('mavlink');
    await d.connect();
    const gf = createCircularGeofence(0, 0, 2000000); // 2000km radius (always inside for test)
    d.setGeofence(gf);
    d.handleIncomingTelemetry({ lat: 0.001, lon: 0.001, alt: 10, heading: 0, speed: 0, battery: 50, timestamp: Date.now() });
    const res = await d.arm();
    expect(res).toBe(true);
  });

  test('safety override blocks arm', async () => {
    const d = new DroneControl('mavlink');
    await d.connect();
    d.handleIncomingTelemetry({ lat: 1, lon: 1, alt: 10, heading: 0, speed: 0, battery: 50, timestamp: Date.now() });
    d.setSafetyOverride(() => false);
    const res = await d.arm();
    expect(res).toBe(false);
  });
});
