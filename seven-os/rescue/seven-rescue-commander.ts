// © 2026 Global Infrastructure Advisory
// Seven Runtime — SevenRescueCommander (Air + Ground + Thermal Search)

import { SevenRuntime } from "../seven";
import { OrchestratorMissionRequest } from "../drone/drone-orchestrator";
import { DisasterType } from "../safety/disaster-profile";
import { SevenNarrator } from "../../voice/narrator/seven-narrator";

import { GroundControl } from "../ground/ground-control";
import { GeoThermalSearch, ThermalSample } from "../sensors/search-thermal";
import { RescueUnit } from "./rescue-unit";

export type RescueSector =
    | "cattle"
    | "crop"
    | "powerline"
    | "pipeline"
    | "road"
    | "bridge"
    | "town"
    | "forest"
    | "industrial"
    | "mine"
    | "collapse";

export interface RescueRequest {
    sector: RescueSector;
    disaster: DisasterType;
    location: { lat: number; lon: number };
    radiusMeters: number;
    baseAltAGL: number;
    droneIds: string[];
}

export interface GroundRescueRequest {
    sector: RescueSector;
    disaster: DisasterType;
    unit: RescueUnit;          // now generic: drone, rover, dog-harness
    samples: ThermalSample[];

export class SevenRescueCommander {
    private seven: SevenRuntime;
    private narrator: SevenNarrator;
    private geoThermal: GeoThermalSearch;

    constructor(seven: SevenRuntime, narrator: SevenNarrator) {
        this.seven = seven;
        this.narrator = narrator;
        this.geoThermal = new GeoThermalSearch();
    }

    // ---------------------------------------------------------
    // AIR RESCUE (DRONE SWARM)
    // ---------------------------------------------------------
    async launchRescue(req: RescueRequest) {
        const missionReq: OrchestratorMissionRequest = {
            sector: req.sector,
            mode: "GRID",
            areaCenter: req.location,
            areaWidthMeters: req.radiusMeters * 2,
            areaHeightMeters: req.radiusMeters * 2,
            baseAltAGL: req.baseAltAGL
        };

        await this.narrator.handleEvent({
            type: "MISSION_START",
            sector: req.sector,
            disasterType: req.disaster
        });

        const result = await this.seven.launchDisasterSwarm(
            req.disaster,
            missionReq,
            req.droneIds
        );

        await this.narrator.handleEvent({
            type: "MISSION_END",
            sector: req.sector,
            disasterType: req.disaster
        });

        return result;
    }

    // ---------------------------------------------------------
    // GROUND RESCUE (ROVER + DOG HARNESS)
    // ---------------------------------------------------------
    async launchGroundSearch(req: GroundRescueRequest) {
        // Analyze thermal samples for human signatures
        const hits = this.geoThermal.analyze(req.samples);
    
        await req.unit.connect();
await req.unit.sendCommand({
    type: "GOTO",
    payload: { lat: best.lat, lon: best.lon }
});

        if (hits.length === 0) {
            await this.narrator.handleEvent({
                type: "HAZARD_DETECTED",
                sector: req.sector,
                disasterType: req.disaster,
                details: { message: "No human heat signatures detected" }
            });

            return { hits: [] };
        }

        // Pick highest-confidence hit
        const best = hits.sort((a, b) => b.confidence - a.confidence)[0];

        // Connect ground unit
        await req.unit.connect();

        // Send rover/dog to target
        await req.unit.sendCommand({
            type: "GOTO",
            payload: { lat: best.lat, lon: best.lon }
        });

        // Narrator informs responders/victims
        await this.narrator.handleEvent({
            type: "RESCUE_INBOUND",
            sector: req.sector,
            disasterType: req.disaster,
            details: { lat: best.lat, lon: best.lon }
        });

        return { hits, target: best };
    }
}

