export type VehicleType =
  | "rover"
  | "ugv"
  | "utility"
  | "custom"
  | "quad"
  | "vtol"
  | "fixed-wing"
  | "heavy-lift"
  | "thermal"
  | "lidar";

export interface VehicleTelemetry {
  lat: number;
  lon: number;
  alt?: number;
  heading?: number;
  speed?: number;
  battery?: number;
  timestamp: number;
}

export interface VehicleCommand {
  type: "GOTO" | "HOLD" | "PATROL" | "RETURN" | "LAND" | "TAKEOFF";
  payload?: any;
}

export interface VehicleStatus {
  connected: boolean;
  mode: string;
  lastTelemetry?: VehicleTelemetry;
}

export class UniversalVehiclePlugin {
  readonly id: string;
  readonly type: VehicleType;

  private status: VehicleStatus = {
    connected: false,
    mode: "IDLE"
  };

  private sdk: any = null;

  constructor(id: string, type: VehicleType) {
    this.id = id;
    this.type = type;
  }

  /**
   * Auto‑detect and initialize correct SDK
   */
  async initialize() {
    try {
      switch (this.type) {
        case "rover":
        case "ugv":
          this.sdk = await this.initGroundSDK();
          break;

        case "utility":
        case "custom":
          this.sdk = await this.initUtilitySDK();
          break;

        case "quad":
        case "vtol":
        case "fixed-wing":
        case "heavy-lift":
        case "thermal":
        case "lidar":
          this.sdk = await this.initDroneSDK();
          break;
      }

      console.log(`[Vehicle] ${this.type} ${this.id} SDK initialized`);
      return true;
    } catch (err) {
      console.error("[Vehicle] SDK initialization failed:", err);
      return false;
    }
  }

  private async initGroundSDK() {
    // Example: ROS or custom rover SDK
    return { name: "ground-sdk", connect: async () => true };
  }

  private async initUtilitySDK() {
    // Example: cleaning robot, office utility bot, etc.
    return { name: "utility-sdk", connect: async () => true };
  }

  private async initDroneSDK() {
    // Example: MAVLink, DJI, PX4, custom flight stack
    return { name: "drone-sdk", connect: async () => true };
  }

  async connect() {
    if (!this.sdk) await this.initialize();
    const ok = await this.sdk.connect();
    this.status.connected = ok;
    console.log(`[Vehicle] ${this.id} connected (${this.type})`);
    return ok;
  }

  getStatus() {
    return this.status;
  }

  async sendCommand(cmd: VehicleCommand) {
    if (!this.status.connected) return false;

    try {
      console.log(`[Vehicle] Command → ${this.id}`, cmd);
      // Translate command to SDK here
      return true;
    } catch (err) {
      console.error("[Vehicle] Command failed:", err);
      return false;
    }
  }

  handleTelemetry(t: VehicleTelemetry) {
    this.status.lastTelemetry = t;
  }
}
