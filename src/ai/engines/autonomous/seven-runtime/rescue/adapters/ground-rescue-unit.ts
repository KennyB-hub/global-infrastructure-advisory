// © 2026 Global Infrastructure Advisory
// Seven Runtime — Ground Rescue Adapter

import { GroundPlugin } from "../../ground/ground-plugin";

export class GroundRescueUnit {
    constructor(private unit: GroundPlugin) {}

    async goto(lat: number, lon: number) {
        return this.unit.sendCommand({
            type: "GOTO",
            payload: { lat, lon }
        });
    }

    async status() {
        return this.unit.getStatus();
    }
}
