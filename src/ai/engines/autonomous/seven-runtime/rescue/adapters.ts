// © 2026 Global Infrastructure Advisory
// Seven Runtime — RescueUnit Adapters

import { RescueUnit, RescueUnitKind, RescueUnitCommand, RescueUnitStatus } from "./rescue-unit";
import { DroneControl } from "../drone/drone-control";
import { GroundControl } from "../ground/ground-control";

export class DroneRescueUnit implements RescueUnit {
    id: string;
    kind: RescueUnitKind = "drone";
    private drone: DroneControl;

    constructor(id: string, drone: DroneControl) {
        this.id = id;
        this.drone = drone;
    }

    async connect(): Promise<boolean> {
        return this.drone.connect();
    }

    async sendCommand(cmd: RescueUnitCommand): Promise<boolean> {
        switch (cmd.type) {
            case "GOTO":
                return this.drone.goto(
                    cmd.payload.lat,
                    cmd.payload.lon,
                    cmd.payload.alt ?? 60
                );
            case "RETURN":
                return this.drone.returnToHome();
            case "HOLD":
                return this.drone.hold();
            default:
                return true;
        }
    }

    getStatus(): RescueUnitStatus {
        const s = this.drone.getStatus();
        return {
            id: this.id,
            kind: this.kind,
            connected: s.connected,
            lat: s.lastTelemetry?.lat,
            lon: s.lastTelemetry?.lon,
            battery: s.lastTelemetry?.battery
        };
    }
}

export class GroundRescueUnit implements RescueUnit {
    id: string;
    kind: RescueUnitKind;
    private ground: GroundControl;

    constructor(id: string, ground: GroundControl) {
        this.id = id;
        this.ground = ground;
        this.kind = ground.type === "rover" ? "rover" : "dog-harness";
    }

    async connect(): Promise<boolean> {
        return this.ground.connect();
    }

    async sendCommand(cmd: RescueUnitCommand): Promise<boolean> {
        return this.ground.sendCommand({
            type: cmd.type as any,
            payload: cmd.payload
        });
    }

    getStatus(): RescueUnitStatus {
        const s = this.ground.getStatus();
        return {
            id: this.id,
            kind: this.kind,
            connected: s.connected,
            lat: s.lastTelemetry?.lat,
            lon: s.lastTelemetry?.lon,
            battery: s.lastTelemetry?.battery
        };
    }
}
