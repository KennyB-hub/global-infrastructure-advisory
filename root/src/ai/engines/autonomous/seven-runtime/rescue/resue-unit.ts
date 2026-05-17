// © 2026 Global Infrastructure Advisory
// Seven Runtime — Unified Rescue Unit Abstraction

export type RescueUnitKind = "drone" | "rover" | "dog-harness";

export interface RescueUnitCommand {
    type: "GOTO" | "HOLD" | "RETURN" | "PATROL";
    payload?: any;
}

export interface RescueUnitStatus {
    id: string;
    kind: RescueUnitKind;
    connected: boolean;
    lat?: number;
    lon?: number;
    battery?: number;
    extra?: Record<string, any>;
}

export interface RescueUnit {
    id: string;
    kind: RescueUnitKind;
    connect(): Promise<boolean>;
    sendCommand(cmd: RescueUnitCommand): Promise<boolean>;
    getStatus(): RescueUnitStatus;
}
