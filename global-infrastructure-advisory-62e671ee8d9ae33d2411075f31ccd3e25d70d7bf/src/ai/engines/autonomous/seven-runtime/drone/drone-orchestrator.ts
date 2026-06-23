// © 2026 Global Infrastructure Advisory
// Seven Runtime — Drone Orchestrator (Sector-Aware)

import { DroneControl } from "./drone-control";
import { DroneMissionPlanner, MissionPlan } from "./drone-mission-planner";
import { TerrainAwareRouting } from "./terrain-routing";

export type SectorType =
    | "cattle"
    | "crop"
    | "powerline"
    | "pipeline"
    | "forestry"
    | "search"
    | "survey";

export interface OrchestratorMissionRequest {
    sector: SectorType;
    mode: "GRID" | "LINE" | "FOLLOW_PATH";
    areaCenter?: { lat: number; lon: number };
    areaWidthMeters?: number;
    areaHeightMeters?: number;
    start?: { lat: number; lon: number };
    end?: { lat: number; lon: number };
    baseAltAGL: number;
}

export class DroneOrchestrator {
    private drone: DroneControl;
    private planner: DroneMissionPlanner;
    private terrainRouting: TerrainAwareRouting;

    constructor(
        drone: DroneControl,
        planner: DroneMissionPlanner,
        terrainRouting: TerrainAwareRouting
    ) {
        this.drone = drone;
        this.planner = planner;
        this.terrainRouting = terrainRouting;
    }

    async launchMission(req: OrchestratorMissionRequest): Promise<MissionPlan | null> {
        const connected = await this.drone.connect();
        if (!connected) return null;

        await this.drone.arm();

        let plan: MissionPlan;

        if (req.mode === "GRID" && req.areaCenter && req.areaWidthMeters && req.areaHeightMeters) {
            plan = this.planner.createGridMission(
                req.areaCenter,
                req.areaWidthMeters,
                req.areaHeightMeters,
                40, // spacing
                req.baseAltAGL,
                req.sector
            );
        } else if (req.mode === "LINE" && req.start && req.end) {
            const safePath = this.terrainRouting.buildSafePath(
                req.start,
                req.end,
                req.baseAltAGL
            );

            plan = {
                id: crypto.randomUUID(),
                name: `${req.sector}-terrain-line`,
                createdAt: Date.now(),
                sector: req.sector,
                waypoints: safePath
            };
        } else {
            return null;
        }

        await this.drone.takeoff(req.baseAltAGL + 10);
        await this.planner.executeMission(plan);
        await this.drone.returnToHome();
        await this.drone.land();

        return plan;
    }
}
