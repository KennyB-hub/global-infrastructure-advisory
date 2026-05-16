// © 2026 Global Infrastructure Advisory
// Seven Runtime — Multi-Drone Swarm Controller

import { DroneControl } from "./drone-control";
import { DroneMissionPlanner } from "./drone-mission-planner";
import { TerrainAwareRouting } from "./terrain-routing";
import { OrchestratorMissionRequest } from "./drone-orchestrator";

export class SwarmController {
    private drones: Map<string, DroneControl> = new Map();
    private planners: Map<string, DroneMissionPlanner> = new Map();
    private terrain: TerrainAwareRouting;

    constructor(terrain: TerrainAwareRouting) {
        this.terrain = terrain;
    }

    registerDrone(id: string, drone: DroneControl) {
        this.drones.set(id, drone);
        this.planners.set(id, new DroneMissionPlanner(drone));
    }

    unregisterDrone(id: string) {
        this.drones.delete(id);
        this.planners.delete(id);
    }

    async launchSwarmMission(
        req: OrchestratorMissionRequest,
        droneIds: string[]
    ) {
        const missions = [];

        for (const id of droneIds) {
            const drone = this.drones.get(id);
            const planner = this.planners.get(id);
            if (!drone || !planner) continue;

            await drone.connect();
            await drone.arm();

            const offset = (Math.random() - 0.5) * 0.0003;

            const modifiedReq = {
                ...req,
                areaCenter: req.areaCenter
                    ? {
                          lat: req.areaCenter.lat + offset,
                          lon: req.areaCenter.lon + offset
                      }
                    : undefined
            };

            missions.push(planner.executeMission(
                planner.createGridMission(
                    modifiedReq.areaCenter!,
                    req.areaWidthMeters!,
                    req.areaHeightMeters!,
                    40,
                    req.baseAltAGL,
                    req.sector
                )
            ));
        }

        return Promise.all(missions);
    }
}
