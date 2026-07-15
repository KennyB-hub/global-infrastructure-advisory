import { DroneControl } from './drone-control';
import { DroneMissionPlanner } from './drone-mission-planner';
import { TerrainAwareRouting } from './terrain-routing';
import { DroneOrchestrator } from './drone-orchestrator';
import { createCircularGeofence } from './geofence';

describe('DroneOrchestrator geofence enforcement', () => {
  const mockTerrain = { sampleAt: (lat:number, lon:number) => ({ lat, lon, elevation: 0, slope: 0, vegetation: 'low' as const }) };

  test('blocks mission when a waypoint is outside geofence', async () => {
    const drone = new DroneControl('mavlink');
    const planner = new DroneMissionPlanner(drone);
    const routing = new TerrainAwareRouting(mockTerrain);
    const orchestrator = new DroneOrchestrator(drone, planner, routing);

    // small geofence around 0,0 radius 100m
    const gf = createCircularGeofence(0, 0, 100);
    drone.setGeofence(gf);

    // provide telemetry inside geofence so arm prechecks pass
    drone.handleIncomingTelemetry({ lat: 0, lon: 0, alt: 10, heading:0, speed:0, battery: 80, timestamp: Date.now() });

    const req = {
      sector: 'survey',
      mode: 'LINE',
      start: { lat: 1, lon: 1 }, // outside small geofence
      end: { lat: 1.001, lon: 1.001 },
      baseAltAGL: 20
    } as any;

    const res = await orchestrator.launchMission(req);
    expect(res).toBeNull();
  });

  test('allows mission when all waypoints are inside geofence', async () => {
    const drone = new DroneControl('mavlink');
    const planner = new DroneMissionPlanner(drone);
    const routing = new TerrainAwareRouting(mockTerrain);
    const orchestrator = new DroneOrchestrator(drone, planner, routing);

    // large geofence covering wide area
    const gf = createCircularGeofence(0, 0, 2000000); // 2000km
    drone.setGeofence(gf);
    drone.handleIncomingTelemetry({ lat: 0.001, lon: 0.001, alt: 10, heading:0, speed:0, battery: 80, timestamp: Date.now() });

    const req = {
      sector: 'survey',
      mode: 'LINE',
      start: { lat: 0.001, lon: 0.001 },
      end: { lat: 0.002, lon: 0.002 },
      baseAltAGL: 20
    } as any;

    const plan = await orchestrator.launchMission(req);
    expect(plan).not.toBeNull();
    if (plan) expect(plan.id || plan.plan).toBeDefined();
  });
});
