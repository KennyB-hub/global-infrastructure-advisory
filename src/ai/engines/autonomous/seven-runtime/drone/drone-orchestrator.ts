// © 2026 Global Infrastructure Advisory
// Seven Runtime — Drone Orchestrator (Sector-Aware)

import { DroneControl } from "./drone-control";
import { DroneMissionPlanner, MissionPlan } from "./drone-mission-planner";
import { TerrainAwareRouting } from "./terrain-routing";
import { writeLog } from "../../../../logs/log-writer.js";

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

        // Geofence enforcement: ensure all planned waypoints fall inside drone's configured geofence
        if (plan && plan.waypoints && plan.waypoints.length) {
            for (const wp of plan.waypoints) {
                if (typeof (this.drone as any).isInsideGeofence === 'function') {
                    const ok = (this.drone as any).isInsideGeofence(wp.lat, wp.lon);
                    if (!ok) {
                        console.warn('[DroneOrchestrator] Mission aborted: waypoint outside geofence', wp);
                        // Audit the blocked mission
                        try {
                            await writeLog('audit', {
                                auditId: crypto.randomUUID(),
                                actor: 'DroneOrchestrator',
                                action: 'MISSION_BLOCKED',
                                reason: 'outside_geofence',
                                waypoint: wp,
                                request: req || null
                            });
                        } catch (e) {
                            console.error('[DroneOrchestrator] Failed to write audit log:', e);
                        }

                        return null;
                    }
                }
            }
        }

        await this.drone.takeoff(req.baseAltAGL + 10);
        await this.planner.executeMission(plan);
        await this.drone.returnToHome();
        await this.drone.land();

        return plan;
    }
}
