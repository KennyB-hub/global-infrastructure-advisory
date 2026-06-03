// © 2026 Global Infrastructure Advisory
// Seven Runtime — Sector Safety Engine (Generic)

import { MissionPlan } from "../drone/drone-mission-planner";

export interface SafetyZone {
    lat: number;
    lon: number;
    radiusMeters: number;
    type: "no-fly" | "reduced-altitude" | "no-spray" | "caution";
}

export interface SafetyContext {
    sector: string;
    zones: SafetyZone[];
    minAltAGL: number;
    maxAltAGL: number;
}

export class SectorSafetyEngine {
    validateMission(plan: MissionPlan, ctx: SafetyContext): { ok: boolean; reasons: string[] } {
        const reasons: string[] = [];

        for (const wp of plan.waypoints) {
            for (const zone of ctx.zones) {
                const d = this.distanceMeters(wp.lat, wp.lon, zone.lat, zone.lon);

                if (d <= zone.radiusMeters) {
                    if (zone.type === "no-fly") {
                        reasons.push(`Waypoint inside NO-FLY zone at ${zone.lat},${zone.lon}`);
                    }
                    if (zone.type === "no-spray" && ctx.sector === "cattle") {
                        reasons.push(`Waypoint inside NO-SPRAY zone near herd`);
                    }
                }
            }

            if (wp.alt < ctx.minAltAGL) {
                reasons.push(`Waypoint below minimum altitude: ${wp.alt}m`);
            }
            if (wp.alt > ctx.maxAltAGL) {
                reasons.push(`Waypoint above maximum altitude: ${wp.alt}m`);
            }
        }

        return {
            ok: reasons.length === 0,
            reasons
        };
    }

    private distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
        const R = 6371000;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) ** 2;
        return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
