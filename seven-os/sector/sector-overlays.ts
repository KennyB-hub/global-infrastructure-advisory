// seven-os/sector/sector-overlays.ts

export interface SystemContext {
    location?: {
        regionId?: string | number | null;
        gridCell?: string | number | null;
        parcelId?: string | number | null;
    };
    sector?: {
        cropType?: string | null;
        assetType?: string | null;
        zoningClass?: string | null;
        routeType?: string | null;
        corridorId?: string | null;
        infrastructureId?: string | null;
        sourceType?: string | null;
        hazards?: string[];
        incidentId?: string | null;
        towerId?: string | null;
        provider?: string | null;
        cloudRegion?: string | null;
        systemId?: string | null;
        agency?: string | null;
        facilityId?: string | null;
        institutionType?: string | null;
        asn?: number | null;
        mode?: "rail" | "air" | "road" | "sea" | string | null;
        orbitClass?: "LEO" | "MEO" | "GEO" | string | null;
        vehicleId?: string | null;
        missionPhase?: string | null;
    };
    environment?: {
        soilType?: string | null;
        moisture?: number | string | null;
        riskZones?: string[];
        cyberThreat?: string;
        trustZone?: string;
        alerts?: string[];
        signal?: string;
        outageRisk?: string;
        latency?: number | null;
        cloudOutageRisk?: string;
        waterQuality?: string;
        alertLevel?: string;
        loadLevel?: string;
        financialRisk?: number | null;
        routeHealth?: string;
        dnsIntegrity?: string;
        climateHazard?: string | null;
        hazardSeverity?: string | null;
    };
}

export const SectorOverlays = {
    agriculture: (ctx: any) => ({
        cropType: ctx.sector?.cropType || null,
        soil: ctx.environment?.soilType || null,
        moisture: ctx.environment?.moisture || null,
        region: ctx.location?.regionId,
        gridCell: ctx.location?.gridCell
    }),
    construction: (ctx: any) => ({
        assetType: ctx.sector?.assetType || null,
        zoningClass: ctx.sector?.zoningClass || null,
        region: ctx.location?.regionId,
        gridCell: ctx.location?.gridCell
    }),
    logistics: (ctx: any) => ({
        routeType: ctx.sector?.routeType || null,
        corridorId: ctx.sector?.corridorId || null,
        region: ctx.location?.regionId,
        gridCell: ctx.location?.gridCell
    }),
    energy: (ctx: any) => ({
        infrastructureId: ctx.sector?.infrastructureId || null,
        sourceType: ctx.sector?.sourceType || null,
        riskZones: ctx.environment?.riskZones || [],
        region: ctx.location?.regionId,
        gridCell: ctx.location?.gridCell
    }),
    emergency: (ctx: any) => ({
        hazards: ctx.sector?.hazards || [],
        incidentId: ctx.sector?.incidentId || null,
        region: ctx.location?.regionId,
        parcel: ctx.location?.parcelId
    }),
    cyber: (ctx: any) => ({
        threatLevel: ctx.environment?.cyberThreat || "unknown",
        trustZone: ctx.environment?.trustZone || "public",
        activeAlerts: ctx.environment?.alerts || [],
        region: ctx.location?.regionId,
        gridCell: ctx.location?.gridCell
    }),
    telecom: (ctx: any) => ({
        towerId: ctx.sector?.towerId || null,
        signalQuality: ctx.environment?.signal || "unknown",
        outageRisk: ctx.environment?.outageRisk || "low",
        region: ctx.location?.regionId,
        gridCell: ctx.location?.gridCell
    }),
    cloud: (ctx: any) => ({
        provider: ctx.sector?.provider || "unknown",
        region: ctx.sector?.cloudRegion || null,
        latency: ctx.environment?.latency || null,
        outageRisk: ctx.environment?.cloudOutageRisk || "low",
        trustZone: ctx.environment?.trustZone || "public"
    }),
    water: (ctx: any) => ({
        systemId: ctx.sector?.systemId || null,
        qualityStatus: ctx.environment?.waterQuality || "unknown",
        region: ctx.location?.regionId,
        gridCell: ctx.location?.gridCell
    }),
    public_safety: (ctx: any) => ({
        agency: ctx.sector?.agency || null,
        alertLevel: ctx.environment?.alertLevel || "normal",
        region: ctx.location?.regionId,
        gridCell: ctx.location?.gridCell
    }),
    health: (ctx: any) => ({
        facilityId: ctx.sector?.facilityId || null,
        loadLevel: ctx.environment?.loadLevel || "unknown",
        region: ctx.location?.regionId
    }),
    finance: (ctx: any) => ({
        marketRegion: ctx.location?.regionId,
        riskIndex: ctx.environment?.financialRisk || null
    }),
    education: (ctx: any) => ({
        institutionType: ctx.sector?.institutionType || null,
        region: ctx.location?.regionId
    }),
    network: (ctx: any) => ({
        asn: ctx.sector?.asn || null,
        routeHealth: ctx.environment?.routeHealth || "unknown",
        dnsIntegrity: ctx.environment?.dnsIntegrity || "unknown",
        region: ctx.location?.regionId
    }),
    transport: (ctx: any) => ({
        mode: ctx.sector?.mode || null,
        corridorId: ctx.sector?.corridorId || null,
        region: ctx.location?.regionId,
        gridCell: ctx.location?.gridCell
    }),
    climate: (ctx: any) => ({
        hazardType: ctx.environment?.climateHazard || null,
        severity: ctx.environment?.hazardSeverity || null,
        region: ctx.location?.regionId,
        gridCell: ctx.location?.gridCell
    }),
    space: (ctx: any) => ({
        orbitClass: ctx.sector?.orbitClass || null,
        vehicleId: ctx.sector?.vehicleId || null,
        missionPhase: ctx.sector?.missionPhase || null,
        groundRegion: ctx.location?.regionId,
        groundGridCell: ctx.location?.gridCell
    })
};
