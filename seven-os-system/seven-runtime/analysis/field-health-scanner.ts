// © 2026 Global Infrastructure Advisory
// Seven Runtime — Field Health Scanner (Sector-Agnostic)

export type HealthSector = "pasture" | "crop" | "corridor" | "forest";

export interface HealthSample {
    lat: number;
    lon: number;
    ndvi?: number;
    moisture?: number;
    canopy?: number;
    notes?: string;
}

export interface HealthSummary {
    sector: HealthSector;
    avgNDVI?: number;
    avgMoisture?: number;
    avgCanopy?: number;
    stressZones: Array<{ lat: number; lon: number; reason: string }>;
}

export class FieldHealthScanner {
    analyze(sector: HealthSector, samples: HealthSample[]): HealthSummary {
        const ndviValues = samples.map(s => s.ndvi).filter(v => v !== undefined) as number[];
        const moistureValues = samples.map(s => s.moisture).filter(v => v !== undefined) as number[];
        const canopyValues = samples.map(s => s.canopy).filter(v => v !== undefined) as number[];

        const avg = (arr: number[]) =>
            arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : undefined;

        const stressZones: Array<{ lat: number; lon: number; reason: string }> = [];

        for (const s of samples) {
            if (s.ndvi !== undefined && s.ndvi < 0.3) {
                stressZones.push({ lat: s.lat, lon: s.lon, reason: "Low NDVI (stress)" });
            }
            if (s.moisture !== undefined && s.moisture < 0.2) {
                stressZones.push({ lat: s.lat, lon: s.lon, reason: "Low moisture" });
            }
        }

        return {
            sector,
            avgNDVI: avg(ndviValues),
            avgMoisture: avg(moistureValues),
            avgCanopy: avg(canopyValues),
            stressZones
        };
    }
}
