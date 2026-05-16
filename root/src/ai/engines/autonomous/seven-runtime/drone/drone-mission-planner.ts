// © 2026 Global Infrastructure Advisory
// Seven Runtime — Drone Mission Planner

import { DroneControl } from "./drone-control";

export interface MissionWaypoint {
    lat: number;
    lon: number;
    alt: number;
    holdSeconds?: number;
}

export interface MissionPlan {
    id: string;
    name: string;
    waypoints: MissionWaypoint[];
    createdAt: number;
    sector: "cattle" | "powerline" | "pipeline" | "survey" | "search";
}

export class DroneMissionPlanner {
    private drone: DroneControl;

    constructor(drone: DroneControl) {
        this.drone = drone;
    }

    createSimpleLineMission(
        start: { lat: number; lon: number },
        end: { lat: number; lon: number },
        alt: number,
        sector: MissionPlan["sector"]
    ): MissionPlan {
        return {
            id: crypto.randomUUID(),
            name: `${sector}-line-mission`,
            createdAt: Date.now(),
            sector,
            waypoints: [
                { lat: start.lat, lon: start.lon, alt },
                { lat: end.lat, lon: end.lon, alt }
            ]
        };
    }

    createGridMission(
        center: { lat: number; lon: number },
        widthMeters: number,
        heightMeters: number,
        spacingMeters: number,
        alt: number,
        sector: MissionPlan["sector"]
    ): MissionPlan {
        const waypoints: MissionWaypoint[] = [];
        const rows = Math.max(1, Math.floor(heightMeters / spacingMeters));
        const cols = Math.max(1, Math.floor(widthMeters / spacingMeters));

        for (let r = 0; r <= rows; r++) {
            for (let c = 0; c <= cols; c++) {
                const latOffset = (r * spacingMeters) / 111_320;
                const lonOffset =
                    (c * spacingMeters) /
                    (111_320 * Math.cos((center.lat * Math.PI) / 180));

                waypoints.push({
                    lat: center.lat + latOffset,
                    lon: center.lon + lonOffset,
                    alt
                });
            }
        }

        return {
            id: crypto.randomUUID(),
            name: `${sector}-grid-mission`,
            createdAt: Date.now(),
            sector,
            waypoints
        };
    }

    async executeMission(plan: MissionPlan): Promise<boolean> {
        console.log("[Seven Drone] Executing mission:", plan.name);
        return this.drone.runMission(plan.waypoints);
    }
}
