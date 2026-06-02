// © 2026 Global Infrastructure Advisory
// Seven Runtime — Drone Plugin Interface

export interface DronePlugin {
    id: string;
    model: string;
    capabilities: string[];
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getTelemetry(): Promise<any>;
    sendCommand(cmd: any): Promise<any>;
}
