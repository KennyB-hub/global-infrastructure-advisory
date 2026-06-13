// © 2026 Global Infrastructure Advisory
// Seven Runtime — Disaster Sector Profile (Fire, Flood, Collapse, Chemical)

import { SafetyContext } from ".safety/sector-safety-engine";

export type DisasterType =
    | "fire"
    | "flood"
    | "tornado"
    | "chemical"
    | "collapse"
    | "search";

export interface DisasterProfile {
    type: DisasterType;
    minAltAGL: number;
    maxAltAGL: number;
    zones: Array<{
        lat: number;
        lon: number;
        radiusMeters: number;
        type: "no-fly" | "caution" | "thermal" | "toxic";
    }>;
    behavior: {
        avoidHeat: boolean;
        avoidSmoke: boolean;
        avoidWater: boolean;
        avoidChemicals: boolean;
        preferHighAltitude: boolean;
        preferDirectPaths: boolean;
        allowRiskIfLifeThreat: boolean;
    };
    emo: {
        tone: string;
        alertLevel: "normal" | "elevated" | "critical";
        messages: {
            enteringZone: string;
            leavingZone: string;
            missionStart: string;
            missionEnd: string;
            hazardDetected: string;
        };
    };
}

export class DisasterProfiles {
    static getProfile(type: DisasterType): DisasterProfile {
        switch (type) {
            case "fire":
                return {
                    type,
                    minAltAGL: 80,
                    maxAltAGL: 200,
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
                            enteringZone: "Entering fire zone. Maintaining safe altitude.",
                            leavingZone: "Exiting fire zone. Conditions improving.",
                            missionStart: "Fire mission initiated. Monitoring heat signatures.",
                            missionEnd: "Fire mission complete. Returning safely.",
                            hazardDetected: "Thermal spike detected. Adjusting route."
                        }
                    }
                };

            case "flood":
                return {
                    type,
                    minAltAGL: 40,
                    maxAltAGL: 120,
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
                            enteringZone: "Entering flood zone. Avoiding low altitude.",
                            leavingZone: "Exiting flood zone. Terrain stabilizing.",
                            missionStart: "Flood mission initiated. Scanning water levels.",
                            missionEnd: "Flood mission complete. Returning safely.",
                            hazardDetected: "Rapid water movement detected. Adjusting path."
                        }
                    }
                };

            case "chemical":
                return {
                    type,
                    minAltAGL: 100,
                    maxAltAGL: 250,
                    zones: [],
                    behavior: {
                        avoidHeat: false,
                        avoidSmoke: true,
                        avoidWater: false,
                        avoidChemicals: true,
                        preferHighAltitude: true,
                        preferDirectPaths: false,
                        allowRiskIfLifeThreat: false
                    },
                    emo: {
                        tone: "cautious",
                        alertLevel: "critical",
                        messages: {
                            enteringZone: "Entering chemical hazard zone. Maintaining maximum safety.",
                            leavingZone: "Exiting chemical zone. Air quality improving.",
                            missionStart: "Chemical mission initiated. Monitoring air toxicity.",
                            missionEnd: "Chemical mission complete. Returning safely.",
                            hazardDetected: "Toxic plume detected. Rerouting immediately."
                        }
                    }
                };

            default:
                return {
                    type,
                    minAltAGL: 50,
                    maxAltAGL: 150,
                    zones: [],
                    behavior: {
                        avoidHeat: false,
                        avoidSmoke: false,
                        avoidWater: false,
                        avoidChemicals: false,
                        preferHighAltitude: false,
                        preferDirectPaths: true,
                        allowRiskIfLifeThreat: true
                    },
                    emo: {
                        tone: "neutral",
                        alertLevel: "normal",
                        messages: {
                            enteringZone: "Entering mission zone.",
                            leavingZone: "Exiting mission zone.",
                            missionStart: "Mission initiated.",
                            missionEnd: "Mission complete.",
                            hazardDetected: "Hazard detected. Adjusting route."
                        }
                    }
                };
        }
    }

    static toSafetyContext(profile: DisasterProfile): SafetyContext {
        return {
            sector: profile.type,
            zones: profile.zones,
            minAltAGL: profile.minAltAGL,
            maxAltAGL: profile.maxAltAGL
        };
    }
}
