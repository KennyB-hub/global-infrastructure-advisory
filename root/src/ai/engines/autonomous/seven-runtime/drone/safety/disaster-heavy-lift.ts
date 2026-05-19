// © 2026 Global Infrastructure Advisory
// Seven Runtime — Heavy-Lift Disaster Drone Profile

import { DisasterProfile } from "./disaster-profile";

export interface HeavyLiftProfile extends DisasterProfile {
    payloadKg: number;
    enduranceMinutes: number;
    prefersLoiter: boolean;
}

export class HeavyLiftDisasterProfiles {
    static forFire(): HeavyLiftProfile {
        return {
            type: "fire",
            minAltAGL: 80,
            maxAltAGL: 220,
            zones: [],
            behavior: {
                avoidHeat: true,
                avoidSmoke: true,
                avoidWater: false,
                avoidChemicals: false,
                preferHighAltitude: true,
                preferDirectPaths: true,
                allowRiskIfLifeThreat: true
            },
            emo: {
                tone: "urgent",
                alertLevel: "critical",
                messages: {
                    enteringZone: "Heavy-lift entering fire zone. Prioritizing crew safety.",
                    leavingZone: "Heavy-lift exiting fire zone. Telemetry stable.",
                    missionStart: "Heavy-lift fire mission initiated.",
                    missionEnd: "Heavy-lift fire mission complete. Returning to base.",
                    hazardDetected: "Severe thermal hazard detected. Adjusting route."
                }
            },
            payloadKg: 20,
            enduranceMinutes: 40,
            prefersLoiter: true
        };
    }

    static forFlood(): HeavyLiftProfile {
        return {
            type: "flood",
            minAltAGL: 50,
            maxAltAGL: 150,
            zones: [],
            behavior: {
                avoidHeat: false,
                avoidSmoke: false,
                avoidWater: true,
                avoidChemicals: false,
                preferHighAltitude: false,
                preferDirectPaths: true,
                allowRiskIfLifeThreat: true
            },
            emo: {
                tone: "steady",
                alertLevel: "elevated",
                messages: {
                    enteringZone: "Heavy-lift entering flood zone. Watching water dynamics.",
                    leavingZone: "Heavy-lift exiting flood zone.",
                    missionStart: "Heavy-lift flood mission initiated.",
                    missionEnd: "Heavy-lift flood mission complete.",
                    hazardDetected: "Rapid water movement detected. Adjusting path."
                }
            },
            payloadKg: 20,
            enduranceMinutes: 45,
            prefersLoiter: false
        };
    }
}
