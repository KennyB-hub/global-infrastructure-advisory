// © 2026 Global Infrastructure Advisory
// Seven Runtime — Unified Sector + Swarm + Disaster Logic

import { DroneControl } from "./drone/drone-cotrol";
import { DroneMissionPlanner } from "./drone/drone-mission-planner";
import { TerrainAwareRouting, TerrainModel } from "./drone/terrain-routing";
import { DroneOrchestrator, OrchestratorMissionRequest } from "./drone/drone-orchestrator";

import { SectorSafetyEngine, SafetyContext } from "./safety/sector-safety-engine";
import { DisasterType, DisasterProfiles } from "./drone/disaster-profile";

import { FieldHealthScanner, HealthSector, HealthSample } from "./analysis/field-health-scanner";

import { DroneRegistry, DronePlugin } from "./drone/drone-registry";
import { SwarmController } from "./drone/swarm-cotroller";
import { DisasterSwarm } from "./disaster/disaster-swarm";

export class SevenRuntime {
    private droneControl: DroneControl;
    private missionPlanner: DroneMissionPlanner;
    private terrainRouting: TerrainAwareRouting;
    private orchestrator: DroneOrchestrator;

    private safety: SectorSafetyEngine;
    private healthScanner: FieldHealthScanner;

    private registry: DroneRegistry;
    private swarm: SwarmController;
    private disasterSwarm: DisasterSwarm;

    constructor(terrainModel: TerrainModel) {
        // Single‑drone core
        this.droneControl = new DroneControl();
        this.missionPlanner = new DroneMissionPlanner(this.droneControl);
        this.terrainRouting = new TerrainAwareRouting(terrainModel);

        this.orchestrator = new DroneOrchestrator(
            this.droneControl,
            this.missionPlanner,
            this.terrainRouting
        );

        // Safety + analysis
        this.safety = new SectorSafetyEngine();
        this.healthScanner = new FieldHealthScanner();

        // Multi‑drone systems
        this.registry = new DroneRegistry();
        this.swarm = new SwarmController(this.terrainRouting);
        this.disasterSwarm = new DisasterSwarm(this.swarm);
    }

    // -----------------------------
    // DRONE REGISTRATION
    // -----------------------------
    registerDrone(plugin: DronePlugin) {
        this.registry.register(plugin);
        this.swarm.registerDrone(plugin.id, plugin.control);
    }

    unregisterDrone(id: string) {
        this.registry.unregister(id);
        this.swarm.unregisterDrone(id);
    }

    // -----------------------------
    // SINGLE‑DRONE MISSIONS
    // -----------------------------
    async launchSectorMission(
        req: OrchestratorMissionRequest,
        safetyCtx: SafetyContext | null = null,
        disasterType: DisasterType | null = null
    ) {
        // Disaster override
        if (disasterType) {
            const profile = DisasterProfiles.getProfile(disasterType);
            safetyCtx = DisasterProfiles.toSafetyContext(profile);

            // OPTIONAL: your emo logic here
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

    // -----------------------------
    // MULTI‑DRONE SWARM MISSIONS
    // -----------------------------
    async launchSwarmMission(
        req: OrchestratorMissionRequest,
        droneIds: string[]
    ) {
        return this.swarm.launchSwarmMission(req, droneIds);
    }

    // -----------------------------
    // DISASTER SWARM MISSIONS
    // -----------------------------
    async launchDisasterSwarm(
        disaster: DisasterType,
        req: OrchestratorMissionRequest,
        droneIds: string[]
    ) {
        return this.disasterSwarm.launchDisasterSwarm(disaster, req, droneIds);
    }

    // -----------------------------
    // FIELD HEALTH ANALYSIS
    // -----------------------------
    analyzeFieldHealth(sector: HealthSector, samples: HealthSample[]) {
        return this.healthScanner.analyze(sector, samples);
    }
}
