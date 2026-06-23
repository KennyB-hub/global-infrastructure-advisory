// © 2026 Global Infrastructure Advisory
// Seven Runtime — Disaster Swarm Mode

import { SwarmController } from "../drone/swarm-controller";
import { DisasterType, DisasterProfiles } from "../safety/disaster-profile";
import { OrchestratorMissionRequest } from "../drone/drone-orchestrator";
import { SectorSafetyEngine } from "../safety/sector-safety-engine";

export class DisasterSwarm {
    private swarm: SwarmController;
    private safety: SectorSafetyEngine;

    constructor(swarm: SwarmController) {
        this.swarm = swarm;
        this.safety = new SectorSafetyEngine();
    }

    async launchDisasterSwarm(
        disaster: DisasterType,
        req: OrchestratorMissionRequest,
        droneIds: string[]
    ) {
        const profile = DisasterProfiles.getProfile(disaster);
        const safetyCtx = DisasterProfiles.toSafetyContext(profile);

        const results = await this.swarm.launchSwarmMission(req, droneIds);

        return {
            results,
            safety: safetyCtx,
            emo: profile.emo
        };
    }
}
