// © 2026 Global Infrastructure Advisory
// Seven Runtime — Terrain-Aware Drone Routing

export interface TerrainSample {
    lat: number;
    lon: number;
    elevation: number; // meters
    slope: number;     // degrees
    vegetation: "low" | "medium" | "high";
}

export interface TerrainModel {
    sampleAt(lat: number, lon: number): TerrainSample;
}

export class TerrainAwareRouting {
    private terrain: TerrainModel;

    constructor(terrain: TerrainModel) {
        this.terrain = terrain;
    }

    buildSafePath(
        start: { lat: number; lon: number },
        end: { lat: number; lon: number },
        baseAltAGL: number
    ): Array<{ lat: number; lon: number; alt: number }> {
        const waypoints: Array<{ lat: number; lon: number; alt: number }> = [];

        const steps = 10;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const lat = start.lat + (end.lat - start.lat) * t;
            const lon = start.lon + (end.lon - start.lon) * t;

            const terrainSample = this.terrain.sampleAt(lat, lon);
            const safetyMargin =
                terrainSample.vegetation === "high" ? 40 :
                terrainSample.vegetation === "medium" ? 30 : 20;

            const alt = terrainSample.elevation + baseAltAGL + safetyMargin;

            waypoints.push({ lat, lon, alt });
        }

        return waypoints;
    }
}
