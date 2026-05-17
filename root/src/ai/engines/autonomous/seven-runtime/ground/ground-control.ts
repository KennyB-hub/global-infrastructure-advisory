// © 2026 Global Infrastructure Advisory
// Seven Runtime — Ground Unit Control (Rover / Dog Harness)

export type GroundUnitType = "rover" | "dog-harness";

export interface GroundTelemetry {
    lat: number;
    lon: number;
    heading?: number;
    speed?: number;
    battery?: number;
    timestamp: number;
}

export interface GroundCommand {
    type: "GOTO" | "HOLD" | "PATROL" | "RETURN";
    payload?: any;
}

export interface GroundStatus {
    connected: boolean;
    mode: string;
    lastTelemetry?: GroundTelemetry;
}

export class GroundControl {
    readonly id: string;
    readonly type: GroundUnitType;

    private status: GroundStatus = {
        connected: false,
        mode: "IDLE"
    };

    constructor(id: string, type: GroundUnitType) {
        this.id = id;
        this.type = type;
    }

    async connect(): Promise<boolean> {
        // TODO: real SDK connection
        this.status.connected = true;
        return true;
    }

    getStatus() {
        return this.status;
    }

    async sendCommand(cmd: GroundCommand): Promise<boolean> {
        if (!this.status.connected) return false;
        // TODO: translate to real rover/dog harness SDK
        console.log("[Seven Ground] Command:", this.id, cmd.type, cmd.payload || {});
        return true;
    }

    handleIncomingTelemetry(t: GroundTelemetry) {
        this.status.lastTelemetry = t;
    }
}
