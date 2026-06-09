// © 2026 Global Infrastructure Advisory
// Seven Runtime — Drone Control Interface

export interface DroneTelemetry {
    lat: number;
    lon: number;
    alt: number;
    heading: number;
    speed: number;
    battery: number;
    timestamp: number;
}

export interface DroneCommand {
    type: "TAKEOFF" | "LAND" | "GOTO" | "RTH" | "HOLD" | "MISSION";
    payload?: any;
}

export interface DroneStatus {
    connected: boolean;
    armed: boolean;
    inAir: boolean;
    mode: string;
    lastTelemetry?: DroneTelemetry;
}

export class DroneControl {
    private status: DroneStatus = {
        connected: false,
        armed: false,
        inAir: false,
        mode: "IDLE"
    };

    private listeners: Array<(t: DroneTelemetry) => void> = [];
    private geofence?: { isInside: (lat: number, lon: number) => boolean };
    private safetyOverride?: () => Promise<boolean> | boolean;

    constructor(private sdkType: "mavlink" | "dji" = "mavlink") {
        // Real SDK initialization happens in initializeSDK()
    }

    // Allow injecting a geofence checker (must provide isInside(lat, lon) -> boolean)
    setGeofence(geofence: { isInside: (lat: number, lon: number) => boolean }) {
        this.geofence = geofence;
    }

    // Optional external safety override hook. Return false to prevent arming.
    setSafetyOverride(fn: () => Promise<boolean> | boolean) {
        this.safetyOverride = fn;
    }

    /**
     * Initialize the drone SDK (MAVLink, DJI, etc.)
     */
    async initializeSDK(): Promise<boolean> {
        try {
            if (this.sdkType === "mavlink") {
                // Example: const sdk = await require("@voxel-dot-ai/mavsdk");
                // this.mavlinkConnection = await sdk.System(...);
                console.log("[Drone] Initializing MAVLink SDK");
            } else if (this.sdkType === "dji") {
                // Example: const dji = await require("dji-mobile-sdk");
                // this.djiConnection = await dji.initialize(...);
                console.log("[Drone] Initializing DJI SDK");
            }
            return true;
        } catch (err) {
            console.error("[Drone] SDK initialization failed:", err);
            return false;
        }
    }

    onTelemetry(listener: (t: DroneTelemetry) => void) {
        this.listeners.push(listener);
    }

    private emitTelemetry(t: DroneTelemetry) {
        this.status.lastTelemetry = t;
        this.listeners.forEach(l => l(t));
    }

    getStatus() {
        return this.status;
    }

    async connect(): Promise<boolean> {
        try {
            // Real SDK connection
            if (this.sdkType === "mavlink") {
                // const system = await mavsdk.System();
                // await system.connect("udp://:14540");
                console.log("[Drone] Connected via MAVLink");
            } else if (this.sdkType === "dji") {
                // const rc = await dji.createRemoteController();
                // await rc.connect();
                console.log("[Drone] Connected via DJI SDK");
            }
            this.status.connected = true;
            return true;
        } catch (err) {
            console.error("[Drone] Connection failed:", err);
            return false;
        }
    }

    // Pre-arm safety checks: telemetry, battery, GPS fix, geofence, external override
    private async runPreArmChecks(): Promise<{ ok: boolean; reason?: string }> {
        const t = this.status.lastTelemetry;
        if (!t) return { ok: false, reason: "no_telemetry" };

        // Battery: require at least 30% to arm
        if (typeof t.battery === "number" && t.battery < 30) return { ok: false, reason: "battery_low" };

        // GPS: require non-zero lat/lon
        if (!t.lat || !t.lon) return { ok: false, reason: "gps_fix_missing" };

        // Geofence: if configured, ensure current position is inside allowed area
        if (this.geofence) {
            try {
                const inside = this.geofence.isInside(t.lat, t.lon);
                if (!inside) return { ok: false, reason: "outside_geofence" };
            } catch (e) {
                return { ok: false, reason: "geofence_check_failed" };
            }
        }

        // External safety override: if provided and returns false, block arming
        if (this.safetyOverride) {
            try {
                const res = await Promise.resolve(this.safetyOverride());
                if (res === false) return { ok: false, reason: "safety_override_rejected" };
            } catch (e) {
                return { ok: false, reason: "safety_override_error" };
            }
        }

        return { ok: true };
    }

    async arm(): Promise<boolean> {
        if (!this.status.connected) return false;

        const checks = await this.runPreArmChecks();
        if (!checks.ok) {
            console.warn("[Drone] Pre-arm checks failed:", checks.reason);
            return false;
        }

        this.status.armed = true;
        return true;
    }

    async takeoff(alt: number): Promise<boolean> {
        return this.sendCommand({
            type: "TAKEOFF",
            payload: { alt }
        });
    }

    async land(): Promise<boolean> {
        return this.sendCommand({ type: "LAND" });
    }

    async returnToHome(): Promise<boolean> {
        return this.sendCommand({ type: "RTH" });
    }

    async goto(lat: number, lon: number, alt: number): Promise<boolean> {
        return this.sendCommand({
            type: "GOTO",
            payload: { lat, lon, alt }
        });
    }

    async hold(): Promise<boolean> {
        return this.sendCommand({ type: "HOLD" });
    }

    async runMission(waypoints: Array<{ lat: number; lon: number; alt: number }>): Promise<boolean> {
        return this.sendCommand({
            type: "MISSION",
            payload: { waypoints }
        });
    }

    private async sendCommand(cmd: DroneCommand): Promise<boolean> {
        if (!this.status.connected) return false;

        try {
            // Real SDK command translation
            if (this.sdkType === "mavlink") {
                // Example: await mavsdk.action[cmd.type.toLowerCase()](cmd.payload);
            } else if (this.sdkType === "dji") {
                // Example: await dji.flightController.sendCommand(...);
            }
            console.log("[Seven Drone] Command:", cmd.type, cmd.payload || {});
            return true;
        } catch (err) {
            console.error("[Drone] Command execution failed:", err);
            return false;
        }
    }

    // Expose geofence check to orchestrators: returns true if no geofence configured or point inside
    isInsideGeofence(lat: number, lon: number): boolean {
        if (!this.geofence) return true;
        try {
            return this.geofence.isInside(lat, lon);
        } catch (e) {
            return false;
        }
    }

    // Stub for incoming telemetry from SDK
    handleIncomingTelemetry(t: DroneTelemetry) {
        this.emitTelemetry(t);
    }
}
