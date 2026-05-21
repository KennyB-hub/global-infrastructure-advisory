// © 2026 Global Infrastructure Advisory
// Seven Runtime — Mock Drone (for testing & simulation)

import { DroneTelemetry, DroneCommand, DroneStatus } from "./drone-cotrol";

export class MockDrone {
  private status: DroneStatus = {
    connected: true,
    armed: false,
    inAir: false,
    mode: "IDLE"
  };

  private currentTelemetry: DroneTelemetry = {
    lat: 40.7128,
    lon: -74.0060,
    alt: 0,
    heading: 0,
    speed: 0,
    battery: 100,
    timestamp: Date.now()
  };

  private listeners: Array<(t: DroneTelemetry) => void> = [];
  private missionWaypoints: Array<{ lat: number; lon: number; alt: number }> = [];
  private currentWaypointIndex: number = 0;
  private simulationInterval: NodeJS.Timeout | null = null;

  constructor(private id: string = "MOCK_DRONE_001") {}

  /**
   * Connect (instant success)
   */
  async connect(): Promise<boolean> {
    this.status.connected = true;
    console.log(`[MockDrone] ${this.id} connected`);
    return true;
  }

  /**
   * Arm the drone
   */
  async arm(): Promise<boolean> {
    if (!this.status.connected) return false;
    this.status.armed = true;
    console.log(`[MockDrone] ${this.id} armed`);
    return true;
  }

  /**
   * Disarm
   */
  async disarm(): Promise<boolean> {
    this.status.armed = false;
    this.status.mode = "IDLE";
    this.stopSimulation();
    console.log(`[MockDrone] ${this.id} disarmed`);
    return true;
  }

  /**
   * Takeoff to altitude
   */
  async takeoff(alt: number): Promise<boolean> {
    if (!this.status.armed) return false;

    this.status.inAir = true;
    this.status.mode = "TAKEOFF";
    console.log(`[MockDrone] ${this.id} takeoff to ${alt}m`);

    this.startSimulation(() => {
      if (this.currentTelemetry.alt < alt) {
        this.currentTelemetry.alt += 2; // Climb 2m per tick
        this.currentTelemetry.timestamp = Date.now();
        this.emitTelemetry();
      } else {
        this.status.mode = "HOVER";
      }
    });

    return true;
  }

  /**
   * Land
   */
  async land(): Promise<boolean> {
    this.status.mode = "LAND";
    console.log(`[MockDrone] ${this.id} landing`);

    this.startSimulation(() => {
      if (this.currentTelemetry.alt > 0) {
        this.currentTelemetry.alt = Math.max(0, this.currentTelemetry.alt - 2);
        this.currentTelemetry.timestamp = Date.now();
        this.emitTelemetry();
      } else {
        this.status.inAir = false;
        this.status.mode = "IDLE";
        this.stopSimulation();
      }
    });

    return true;
  }

  /**
   * Go to waypoint
   */
  async goto(lat: number, lon: number, alt: number): Promise<boolean> {
    if (!this.status.inAir) return false;

    this.status.mode = "AUTONOMOUS";
    console.log(`[MockDrone] ${this.id} goto ${lat}, ${lon}, ${alt}m`);

    this.startSimulation(() => {
      const dlat = lat - this.currentTelemetry.lat;
      const dlon = lon - this.currentTelemetry.lon;
      const dalt = alt - this.currentTelemetry.alt;
      const dist = Math.sqrt(dlat * dlat + dlon * dlon);

      if (dist > 0.0001) {
        // Move 0.00005 degrees per tick (~5 meters)
        const step = 0.00005;
        this.currentTelemetry.lat += (dlat / dist) * step;
        this.currentTelemetry.lon += (dlon / dist) * step;
      }

      if (Math.abs(dalt) > 1) {
        this.currentTelemetry.alt += Math.sign(dalt) * 2;
      }

      this.currentTelemetry.speed = dist > 0.0001 ? 10 : 0;
      this.currentTelemetry.heading = Math.atan2(dlon, dlat) * (180 / Math.PI);
      this.currentTelemetry.timestamp = Date.now();
      this.emitTelemetry();

      // Check if reached
      if (dist < 0.0001 && Math.abs(dalt) <= 1) {
        this.status.mode = "HOVER";
        this.stopSimulation();
      }
    });

    return true;
  }

  /**
   * Run mission (sequence of waypoints)
   */
  async runMission(waypoints: Array<{ lat: number; lon: number; alt: number }>): Promise<boolean> {
    if (!this.status.inAir) return false;

    this.missionWaypoints = waypoints;
    this.currentWaypointIndex = 0;
    this.status.mode = "MISSION";
    console.log(`[MockDrone] ${this.id} running mission with ${waypoints.length} waypoints`);

    if (waypoints.length > 0) {
      const wp = waypoints[0];
      await this.goto(wp.lat, wp.lon, wp.alt);
    }

    return true;
  }

  /**
   * Hold position
   */
  async hold(): Promise<boolean> {
    this.status.mode = "HOLD";
    this.stopSimulation();
    console.log(`[MockDrone] ${this.id} holding position`);
    return true;
  }

  /**
   * Return to home
   */
  async returnToHome(): Promise<boolean> {
    return this.goto(40.7128, -74.0060, 10); // NYC default home
  }

  /**
   * Get status
   */
  getStatus(): DroneStatus {
    return { ...this.status };
  }

  /**
   * Get current telemetry
   */
  getTelemetry(): DroneTelemetry {
    return { ...this.currentTelemetry };
  }

  /**
   * Listen for telemetry updates
   */
  onTelemetry(listener: (t: DroneTelemetry) => void) {
    this.listeners.push(listener);
  }

  /**
   * Private: emit telemetry to listeners
   */
  private emitTelemetry() {
    this.listeners.forEach(l => l({ ...this.currentTelemetry }));
  }

  /**
   * Private: start simulation loop
   */
  private startSimulation(tick: () => void) {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }

    this.simulationInterval = setInterval(tick, 100);
  }

  /**
   * Private: stop simulation loop
   */
  private stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }
}
