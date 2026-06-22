// © 2026 Global Infrastructure Advisory
// Seven Runtime — Responder Interface (EMS + Infrastructure Crews)

import { SevenRuntime } from "../seven";
import { TerrainModel } from "../../src/ai/engines/autonomous/seven-runtime/drone/terrain-routing";
import { SevenNarrator, NarratorSink } from "../../src/ai/engines/autonomous/seven-runtime/voice/seven-narrator";
import { SevenRescueCommander, RescueRequest } from "../../src/ai/engines/autonomous/seven-runtime/rescue/seven-rescue-commander";

export class SevenResponderInterface {
    private seven: SevenRuntime;
    private narrator: SevenNarrator;
    private rescue: SevenRescueCommander;

    constructor(terrain: TerrainModel, sink: NarratorSink) {
        this.seven = new SevenRuntime(terrain);
        this.narrator = new SevenNarrator(sink);
        this.rescue = new SevenRescueCommander(this.seven, this.narrator);
    }

    // High-level rescue entry point (for EMS / county / infrastructure)
    async requestRescue(body: RescueRequest) {
        return this.rescue.launchRescue(body);
    }

    // Normal sector mission (inspection, mapping, infrastructure checks)
    async requestSectorMission(body: {
        req: any; // OrchestratorMissionRequest
        disasterType?: string | null;
    }) {
        return this.seven.launchSectorMission(
            body.req,
            null,
            (body.disasterType as any) ?? null
        );
    }

    // Hook for UI to send manual messages if needed
    async manualMessage(channel: "operator" | "responder" | "public" | "victim", text: string) {
        await this.narrator["speak"](channel, text);
    }
}
