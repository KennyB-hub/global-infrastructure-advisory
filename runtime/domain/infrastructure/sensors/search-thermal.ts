// © 2026 Global Infrastructure Advisory
// Seven Runtime — Geo/Thermal Search Logic

export interface ThermalSample {
    lat: number;
    lon: number;
    tempC: number;
    confidence: number; // 0–1
    timestamp: number;
}

export interface SearchHit {
    lat: number;
    lon: number;
    confidence: number;
    reason: string;
}

export class GeoThermalSearch {
    analyze(samples: ThermalSample[]): SearchHit[] {
        const hits: SearchHit[] = [];

        for (const s of samples) {
            if (s.tempC > 30 && s.confidence > 0.6) {
                hits.push({
                    lat: s.lat,
                    lon: s.lon,
                    confidence: s.confidence,
                    reason: "Human-like heat signature"
                });
            }
        }

        return hits;
    }
}
