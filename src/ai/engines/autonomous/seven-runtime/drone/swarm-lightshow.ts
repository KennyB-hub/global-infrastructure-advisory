// © 2026 Global Infrastructure Advisory
// Seven Runtime — Swarm Light-Show Engine

import { SwarmController } from "./swarm-controller";
import { OrchestratorMissionRequest } from "./drone-orchestrator";

export type LightShowPattern =
    | "WAVE"
    | "CIRCLE"
    | "GRID_PULSE"
    | "SPIRAL"
    | "LOGO";

export interface LightShowConfig {
    pattern: LightShowPattern;
    baseReq: OrchestratorMissionRequest;
    altitudeOffsetPerDrone?: number;
}

export class SwarmLightShow {
    private swarm: SwarmController;

    constructor(swarm: SwarmController) {
        this.swarm = swarm;
    }

    async runShow(config: LightShowConfig, droneIds: string[]) {
        const { pattern, baseReq } = config;

        switch (pattern) {
            case "WAVE":
                return this.wavePattern(baseReq, droneIds, config.altitudeOffsetPerDrone ?? 3);
            case "CIRCLE":
                return this.circlePattern(baseReq, droneIds);
            case "GRID_PULSE":
                return this.gridPulsePattern(baseReq, droneIds);
            case "SPIRAL":
                return this.spiralPattern(baseReq, droneIds);
            case "LOGO":
            default:
                return this.gridPulsePattern(baseReq, droneIds);
        }
    }

    private async wavePattern(
        req: OrchestratorMissionRequest,
        droneIds: string[],
        altStep: number
    ) {
        const missions = droneIds.map((id, index) => {
            const offsetAlt = req.baseAltAGL + index * altStep;
            const modifiedReq: OrchestratorMissionRequest = {
                ...req,
                baseAltAGL: offsetAlt
            };
            return this.swarm.launchSwarmMission(modifiedReq, [id]);
        });

        return Promise.all(missions);
    }

    private async circlePattern(
        req: OrchestratorMissionRequest,
        droneIds: string[]
    ) {
        if (!req.areaCenter) return;

        const radiusMeters = 80;
        const missions = droneIds.map((id, index) => {
            const angle = (2 * Math.PI * index) / droneIds.length;
            const dLat = (radiusMeters * Math.cos(angle)) / 111_320;
            const dLon =
                (radiusMeters * Math.sin(angle)) /
                (111_320 * Math.cos((req.areaCenter!.lat * Math.PI) / 180));

            const center = {
                lat: req.areaCenter!.lat + dLat,
                lon: req.areaCenter!.lon + dLon
            };

            const modifiedReq: OrchestratorMissionRequest = {
                ...req,
                areaCenter: center
            };

            return this.swarm.launchSwarmMission(modifiedReq, [id]);
        });

        return Promise.all(missions);
    }

    private async gridPulsePattern(
        req: OrchestratorMissionRequest,
        droneIds: string[]
    ) {
        // Simple: stagger start times, same mission
        const missions = droneIds.map((id, index) => {
            const delay = index * 1000;
            return new Promise(resolve =>
                setTimeout(
                    () =>
                        resolve(
                            this.swarm.launchSwarmMission(req, [id])
                        ),
                    delay
                )
            );
        });

        return Promise.all(missions);
    }

    private async spiralPattern(
        req: OrchestratorMissionRequest,
        droneIds: string[]
    ) {
        if (!req.areaCenter) return;

        const missions = droneIds.map((id, index) => {
            const radius = 20 + index * 5;
            const angle = index * (Math.PI / 6);

            const dLat = (radius * Math.cos(angle)) / 111_320;
            const dLon =
                (radius * Math.sin(angle)) /
                (111_320 * Math.cos((req.areaCenter!.lat * Math.PI) / 180));

            const center = {
                lat: req.areaCenter!.lat + dLat,
                lon: req.areaCenter!.lon + dLon
            };

            const modifiedReq: OrchestratorMissionRequest = {
                ...req,
                areaCenter: center
            };

            return this.swarm.launchSwarmMission(modifiedReq, [id]);
        });

        return Promise.all(missions);
    }
}
