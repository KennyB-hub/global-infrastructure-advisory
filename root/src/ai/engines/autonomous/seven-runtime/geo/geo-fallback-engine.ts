// © 2026 Global Infrastructure Advisory
// Seven Runtime — Geo Fallback Engine (Satellite-Based)

export interface GeoPoint {
    lat: number;
    lon: number;
    accuracyMeters: number;
    source: "gps" | "satellite-fallback" | "last-known";
}

export interface GeoFallbackInput {
    lastKnown?: GeoPoint;
    terrainHint?: string;
    timestamp: number;
}

export class GeoFallbackEngine {
    constructor(private speak: (msg: string) => void) {}

    estimatePosition(input: GeoFallbackInput): GeoPoint {
        if (input.lastKnown) {
            this.speak("Using last known position with satellite-based drift correction.");
            return {
                ...input.lastKnown,
                accuracyMeters: Math.min(
                    input.lastKnown.accuracyMeters + 100,
                    1000
                ),
                source: "satellite-fallback"
            };
        }

        this.speak("No GPS available. Using coarse satellite-based position estimate.");
        return {
            lat: 0,
            lon: 0,
            accuracyMeters: 5000,
            source: "satellite-fallback"
        };
    }
}
