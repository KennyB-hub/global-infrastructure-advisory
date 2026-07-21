// © 2026 Global Infrastructure Advisory
// Seven Runtime — Unified Sector + Disaster Mission Logic

import { DroneControl } from "../drone/drone-control";
import { DroneMissionPlanner } from "../drone/drone-mission-planner";
import { TerrainAwareRouting, TerrainModel } from "../drone/terrain-routing";
import { DroneOrchestrator, OrchestratorMissionRequest } from "../drone/drone-orchestrator";

import { SectorSafetyEngine, SafetyContext } from "../drone/safety/sector-safety-engine";
import { DisasterType, DisasterProfiles } from "../drone/disaster-profile";

import { FieldHealthScanner, HealthSector, HealthSample } from "../analysis/field-health-scanner";

export class SevenRuntime {
    private droneControl: DroneControl;
    private missionPlanner: DroneMissionPlanner;
    private terrainRouting: TerrainAwareRouting;
    private orchestrator: DroneOrchestrator;
    private safety: SectorSafetyEngine;
    private healthScanner: FieldHealthScanner;

    constructor(terrainModel: TerrainModel) {
        this.droneControl = new DroneControl();
        this.missionPlanner = new DroneMissionPlanner(this.droneControl);
        this.terrainRouting = new TerrainAwareRouting(terrainModel);

        this.orchestrator = new DroneOrchestrator(
            this.droneControl,
            this.missionPlanner,
            this.terrainRouting
        );

        this.safety = new SectorSafetyEngine();
        this.healthScanner = new FieldHealthScanner();
    }

    async launchSectorMission(
        req: OrchestratorMissionRequest,
        safetyCtx: SafetyContext | null = null,
        disasterType: DisasterType | null = null
    ) {
        // If disasterType is provided, override safety context
        if (disasterType) {
            const profile = DisasterProfiles.getProfile(disasterType);
            safetyCtx = DisasterProfiles.toSafetyContext(profile);

            // OPTIONAL: integrate your existing emo logic here
            // this.emo.apply(profile.emo);
        }

        const plan = await this.orchestrator.launchMission(req);
        if (!plan) {
            console.warn("[Seven] Mission creation/launch failed");
            return null;
        }

        if (safetyCtx) {
            const check = this.safety.validateMission(plan, safetyCtx);
            if (!check.ok) {
                console.warn("[Seven] Safety validation failed:", check.reasons);
                return { plan, safety: check };
            }
        }

        return { plan };
    }

    analyzeFieldHealth(sector: HealthSector, samples: HealthSample[]) {
        return this.healthScanner.analyze(sector, samples);
    }
}
