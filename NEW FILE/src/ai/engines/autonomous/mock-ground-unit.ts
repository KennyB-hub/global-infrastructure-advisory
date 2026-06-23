// © 2026 Global Infrastructure Advisory
// Seven Runtime — Mock Ground Unit (for testing & simulation)

/**
 * Ground unit telemetry structure
 */
export interface GroundUnitTelemetry {
  lat: number;
  lon: number;
  heading: number;
  speed: number;
  battery: number;
  obstacles: Array<{ distance: number; bearing: number }>;
  mode: string;
  timestamp: number;
}

/**
 * Ground unit command structure
 */
export interface GroundUnitCommand {
  type: 'GOTO' | 'HOLD' | 'PATROL' | 'RETURN';
  lat?: number;
  lon?: number;
  speed?: number;
  pattern?: 'RECTANGLE' | 'CIRCLE';
}

/**
 * Ground unit status structure
 */
export interface GroundUnitStatus {
  connected: boolean;
  powered: boolean;
  mode: string;
  unitType: 'ROVER' | 'DOG_HARNESS';
}

/**
 * Base MockGroundUnit class for all ground units
 */
export class MockGroundUnit {
  protected status: GroundUnitStatus;
  protected currentTelemetry: GroundUnitTelemetry;
  protected listeners: Array<(t: GroundUnitTelemetry) => void> = [];
  protected simulationInterval: NodeJS.Timeout | null = null;
  protected homePosition: { lat: number; lon: number };

  constructor(
    protected id: string = 'MOCK_GROUND_UNIT_001',
    protected unitType: 'ROVER' | 'DOG_HARNESS' = 'ROVER',
    homeLatitude: number = 40.7128,
    homeLongitude: number = -74.006
  ) {
    this.homePosition = { lat: homeLatitude, lon: homeLongitude };
    
    this.status = {
      connected: false,
      powered: false,
      mode: 'IDLE',
      unitType: this.unitType
    };

    this.currentTelemetry = {
      lat: homeLatitude,
      lon: homeLongitude,
      heading: 0,
      speed: 0,
      battery: 100,
      obstacles: [],
      mode: 'IDLE',
      timestamp: Date.now()
    };
  }

  /**
   * Connect ground unit
   */
  async connect(): Promise<boolean> {
    this.status.connected = true;
    this.status.powered = true;
    console.log(`[MockGroundUnit] ${this.id} (${this.unitType}) connected`);
    return true;
  }

  /**
   * Disconnect ground unit
   */
  async disconnect(): Promise<boolean> {
    this.status.connected = false;
    this.status.powered = false;
    this.stopSimulation();
    console.log(`[MockGroundUnit] ${this.id} disconnected`);
    return true;
  }

  /**
   * Get unit status
   */
  getStatus(): GroundUnitStatus {
    return { ...this.status };
  }

  /**
   * Get current telemetry
   */
  getTelemetry(): GroundUnitTelemetry {
    return { ...this.currentTelemetry };
  }

  /**
   * Listen for telemetry updates
   */
  onTelemetry(listener: (t: GroundUnitTelemetry) => void) {
    this.listeners.push(listener);
  }

  /**
   * Protected: emit telemetry to listeners
   */
  protected emitTelemetry() {
    this.listeners.forEach(l => l({ ...this.currentTelemetry }));
  }

  /**
   * Protected: start simulation loop
   */
  protected startSimulation(tick: () => void) {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
    this.simulationInterval = setInterval(tick, 100);
  }

  /**
   * Protected: stop simulation loop
   */
  protected stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  /**
   * Protected: simulate battery drain (0.5% per minute at full speed)
   */
  protected drainBattery(speed: number) {
    const drainRate = 0.5 / 600; // 0.5% per 600 ticks (60 seconds)
    const speedFactor = speed / 10; // 10 km/h is max speed
    this.currentTelemetry.battery = Math.max(0, this.currentTelemetry.battery - (drainRate * speedFactor));
  }

  /**
   * Protected: detect obstacles within 5 meter radius
   */
  protected detectObstacles(): Array<{ distance: number; bearing: number }> {
    const obstacles: Array<{ distance: number; bearing: number }> = [];
    
    // Simulate random obstacles (simplified for testing)
    // In real scenarios, this would use LIDAR/sensor data
    if (Math.random() < 0.1) {
      const distance = Math.random() * 5;
      const bearing = Math.random() * 360;
      obstacles.push({ distance, bearing });
    }

    return obstacles;
  }

  /**
   * Protected: calculate heading from current position to target
   */
  protected calculateHeading(targetLat: number, targetLon: number): number {
    const dlat = targetLat - this.currentTelemetry.lat;
    const dlon = targetLon - this.currentTelemetry.lon;
    return (Math.atan2(dlon, dlat) * 180) / Math.PI;
  }

  /**
   * Protected: calculate distance between two coordinates (in degrees, ~111km per degree)
   */
  protected calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;
    return Math.sqrt(dlat * dlat + dlon * dlon);
  }
}

/**
 * MockRover class for ROS-like movement simulation
 */
export class MockRover extends MockGroundUnit {
  private targetLat: number = 40.7128;
  private targetLon: number = -74.006;
  private maxSpeed: number = 10; // km/h equivalent
  private currentSpeed: number = 0;
  private patrolWaypoints: Array<{ lat: number; lon: number }> = [];
  private currentPatrolIndex: number = 0;
  private basePosition: { lat: number; lon: number };

  constructor(id: string = 'MOCK_ROVER_001', homeLatitude: number = 40.7128, homeLongitude: number = -74.006) {
    super(id, 'ROVER', homeLatitude, homeLongitude);
    this.basePosition = { lat: homeLatitude, lon: homeLongitude };
  }

  /**
   * Move to specific location (GOTO command)
   */
  async goto(lat: number, lon: number, speed: number = 5): Promise<boolean> {
    if (!this.status.connected || this.currentTelemetry.battery <= 0) {
      return false;
    }

    this.targetLat = lat;
    this.targetLon = lon;
    this.currentSpeed = Math.min(speed, this.maxSpeed);
    this.status.mode = 'GOTO';
    this.currentTelemetry.mode = 'GOTO';

    console.log(`[MockRover] ${this.id} moving to ${lat}, ${lon} at ${speed} km/h`);

    this.startSimulation(() => this.simulateMovement());

    return true;
  }

  /**
   * Hold current position
   */
  async hold(): Promise<boolean> {
    this.currentSpeed = 0;
    this.status.mode = 'HOLD';
    this.currentTelemetry.mode = 'HOLD';
    this.stopSimulation();
    console.log(`[MockRover] ${this.id} holding position`);
    return true;
  }

  /**
   * Start patrol pattern
   */
  async patrol(waypoints: Array<{ lat: number; lon: number }>, speed: number = 3): Promise<boolean> {
    if (!this.status.connected || waypoints.length === 0) {
      return false;
    }

    this.patrolWaypoints = waypoints;
    this.currentPatrolIndex = 0;
    this.currentSpeed = Math.min(speed, this.maxSpeed);
    this.status.mode = 'PATROL';
    this.currentTelemetry.mode = 'PATROL';

    console.log(`[MockRover] ${this.id} starting patrol with ${waypoints.length} waypoints`);

    if (waypoints.length > 0) {
      const wp = waypoints[0];
      this.targetLat = wp.lat;
      this.targetLon = wp.lon;
    }

    this.startSimulation(() => this.simulatePatrol());

    return true;
  }

  /**
   * Return to base
   */
  async returnToBase(): Promise<boolean> {
    if (!this.status.connected) {
      return false;
    }

    this.currentSpeed = 8; // Faster return
    console.log(`[MockRover] ${this.id} returning to base`);
    return this.goto(this.basePosition.lat, this.basePosition.lon, this.currentSpeed);
  }

  /**
   * Get battery level
   */
  getBatteryLevel(): number {
    return Math.round(this.currentTelemetry.battery * 100) / 100;
  }

  /**
   * Check if at target location
   */
  private isAtTarget(): boolean {
    const distance = this.calculateDistance(
      this.currentTelemetry.lat,
      this.currentTelemetry.lon,
      this.targetLat,
      this.targetLon
    );
    return distance < 0.0001; // ~11 meters
  }

  /**
   * Simulate movement towards target
   */
  private simulateMovement() {
    if (this.currentTelemetry.battery <= 0) {
      this.status.mode = 'BATTERY_DEAD';
      this.currentTelemetry.mode = 'BATTERY_DEAD';
      this.stopSimulation();
      return;
    }

    const dlat = this.targetLat - this.currentTelemetry.lat;
    const dlon = this.targetLon - this.currentTelemetry.lon;
    const distance = Math.sqrt(dlat * dlat + dlon * dlon);

    if (distance > 0.0001) {
      // Move step (0.00005 degrees ~ 5 meters)
      const step = (this.currentSpeed / 1000) * 0.00001;
      this.currentTelemetry.lat += (dlat / distance) * step;
      this.currentTelemetry.lon += (dlon / distance) * step;
      this.currentTelemetry.speed = this.currentSpeed;
      this.currentTelemetry.heading = this.calculateHeading(this.targetLat, this.targetLon);
    } else {
      // Reached target
      this.currentSpeed = 0;
      this.currentTelemetry.speed = 0;
      this.status.mode = 'IDLE';
      this.currentTelemetry.mode = 'IDLE';
      this.stopSimulation();
    }

    // Detect obstacles and drain battery
    this.currentTelemetry.obstacles = this.detectObstacles();
    this.drainBattery(this.currentSpeed);
    this.currentTelemetry.timestamp = Date.now();
    this.emitTelemetry();
  }

  /**
   * Simulate patrol pattern
   */
  private simulatePatrol() {
    if (this.currentTelemetry.battery <= 0) {
      this.status.mode = 'BATTERY_DEAD';
      this.currentTelemetry.mode = 'BATTERY_DEAD';
      this.stopSimulation();
      return;
    }

    const dlat = this.targetLat - this.currentTelemetry.lat;
    const dlon = this.targetLon - this.currentTelemetry.lon;
    const distance = Math.sqrt(dlat * dlat + dlon * dlon);

    if (distance > 0.0001) {
      // Move towards current patrol waypoint
      const step = (this.currentSpeed / 1000) * 0.00001;
      this.currentTelemetry.lat += (dlat / distance) * step;
      this.currentTelemetry.lon += (dlon / distance) * step;
      this.currentTelemetry.speed = this.currentSpeed;
      this.currentTelemetry.heading = this.calculateHeading(this.targetLat, this.targetLon);
    } else {
      // Reached waypoint, move to next
      this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolWaypoints.length;
      const nextWp = this.patrolWaypoints[this.currentPatrolIndex];
      this.targetLat = nextWp.lat;
      this.targetLon = nextWp.lon;
    }

    // Detect obstacles and drain battery
    this.currentTelemetry.obstacles = this.detectObstacles();
    this.drainBattery(this.currentSpeed);
    this.currentTelemetry.timestamp = Date.now();
    this.emitTelemetry();
  }
}

/**
 * MockDogHarness class for dog harness unit simulation
 * (simpler movement pattern suitable for leashed/constrained movement)
 */
export class MockDogHarness extends MockGroundUnit {
  private targetLat: number = 40.7128;
  private targetLon: number = -74.006;
  private maxSpeed: number = 6; // km/h (slower than rover)
  private currentSpeed: number = 0;
  private patrolWaypoints: Array<{ lat: number; lon: number }> = [];
  private currentPatrolIndex: number = 0;

  constructor(id: string = 'MOCK_DOG_001', homeLatitude: number = 40.7128, homeLongitude: number = -74.006) {
    super(id, 'DOG_HARNESS', homeLatitude, homeLongitude);
  }

  /**
   * Move to location (GOTO command)
   */
  async goto(lat: number, lon: number, speed: number = 3): Promise<boolean> {
    if (!this.status.connected || this.currentTelemetry.battery <= 0) {
      return false;
    }

    this.targetLat = lat;
    this.targetLon = lon;
    this.currentSpeed = Math.min(speed, this.maxSpeed);
    this.status.mode = 'GOTO';
    this.currentTelemetry.mode = 'GOTO';

    console.log(`[MockDogHarness] ${this.id} moving to ${lat}, ${lon} at ${speed} km/h`);

    this.startSimulation(() => this.simulateMovement());

    return true;
  }

  /**
   * Hold position
   */
  async hold(): Promise<boolean> {
    this.currentSpeed = 0;
    this.status.mode = 'HOLD';
    this.currentTelemetry.mode = 'HOLD';
    this.stopSimulation();
    console.log(`[MockDogHarness] ${this.id} holding position`);
    return true;
  }

  /**
   * Start patrol pattern
   */
  async patrol(waypoints: Array<{ lat: number; lon: number }>, speed: number = 2): Promise<boolean> {
    if (!this.status.connected || waypoints.length === 0) {
      return false;
    }

    this.patrolWaypoints = waypoints;
    this.currentPatrolIndex = 0;
    this.currentSpeed = Math.min(speed, this.maxSpeed);
    this.status.mode = 'PATROL';
    this.currentTelemetry.mode = 'PATROL';

    console.log(`[MockDogHarness] ${this.id} starting patrol with ${waypoints.length} waypoints`);

    if (waypoints.length > 0) {
      const wp = waypoints[0];
      this.targetLat = wp.lat;
      this.targetLon = wp.lon;
    }

    this.startSimulation(() => this.simulatePatrol());

    return true;
  }

  /**
   * Return to home position
   */
  async returnToHome(): Promise<boolean> {
    if (!this.status.connected) {
      return false;
    }

    console.log(`[MockDogHarness] ${this.id} returning home`);
    return this.goto(this.homePosition.lat, this.homePosition.lon, 4);
  }

  /**
   * Get battery level
   */
  getBatteryLevel(): number {
    return Math.round(this.currentTelemetry.battery * 100) / 100;
  }

  /**
   * Simulate movement towards target
   */
  private simulateMovement() {
    if (this.currentTelemetry.battery <= 0) {
      this.status.mode = 'BATTERY_DEAD';
      this.currentTelemetry.mode = 'BATTERY_DEAD';
      this.stopSimulation();
      return;
    }

    const dlat = this.targetLat - this.currentTelemetry.lat;
    const dlon = this.targetLon - this.currentTelemetry.lon;
    const distance = Math.sqrt(dlat * dlat + dlon * dlon);

    if (distance > 0.0001) {
      // Slower movement for dog harness
      const step = (this.currentSpeed / 1200) * 0.00001;
      this.currentTelemetry.lat += (dlat / distance) * step;
      this.currentTelemetry.lon += (dlon / distance) * step;
      this.currentTelemetry.speed = this.currentSpeed;
      this.currentTelemetry.heading = this.calculateHeading(this.targetLat, this.targetLon);
    } else {
      // Reached target
      this.currentSpeed = 0;
      this.currentTelemetry.speed = 0;
      this.status.mode = 'IDLE';
      this.currentTelemetry.mode = 'IDLE';
      this.stopSimulation();
    }

    // Detect obstacles and drain battery
    this.currentTelemetry.obstacles = this.detectObstacles();
    this.drainBattery(this.currentSpeed);
    this.currentTelemetry.timestamp = Date.now();
    this.emitTelemetry();
  }

  /**
   * Simulate patrol pattern
   */
  private simulatePatrol() {
    if (this.currentTelemetry.battery <= 0) {
      this.status.mode = 'BATTERY_DEAD';
      this.currentTelemetry.mode = 'BATTERY_DEAD';
      this.stopSimulation();
      return;
    }

    const dlat = this.targetLat - this.currentTelemetry.lat;
    const dlon = this.targetLon - this.currentTelemetry.lon;
    const distance = Math.sqrt(dlat * dlat + dlon * dlon);

    if (distance > 0.0001) {
      // Move towards current patrol waypoint
      const step = (this.currentSpeed / 1200) * 0.00001;
      this.currentTelemetry.lat += (dlat / distance) * step;
      this.currentTelemetry.lon += (dlon / distance) * step;
      this.currentTelemetry.speed = this.currentSpeed;
      this.currentTelemetry.heading = this.calculateHeading(this.targetLat, this.targetLon);
    } else {
      // Reached waypoint, move to next
      this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolWaypoints.length;
      const nextWp = this.patrolWaypoints[this.currentPatrolIndex];
      this.targetLat = nextWp.lat;
      this.targetLon = nextWp.lon;
    }

    // Detect obstacles and drain battery
    this.currentTelemetry.obstacles = this.detectObstacles();
    this.drainBattery(this.currentSpeed);
    this.currentTelemetry.timestamp = Date.now();
    this.emitTelemetry();
  }
}
