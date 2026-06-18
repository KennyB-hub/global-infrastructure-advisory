export const SectorOverlays = {
 agriculture: (ctx) => ({
    cropType: ctx.sector?.cropType || null,
    soil: ctx.environment?.soilType || null,
    moisture: ctx.environment?.moisture || null,
    region: ctx.location.regionId,
    gridCell: ctx.location.gridCell
  }),

  construction: (ctx) => ({
    assetType: ctx.sector?.assetType || null,
    zoningClass: ctx.sector?.zoningClass || null,
    region: ctx.location.regionId,
    gridCell: ctx.location.gridCell
  }),

  logistics: (ctx) => ({
    routeType: ctx.sector?.routeType || null,
    corridorId: ctx.sector?.corridorId || null,
    region: ctx.location.regionId,
    gridCell: ctx.location.gridCell
  }),

   energy: (ctx) => ({
    infrastructureId: ctx.sector?.infrastructureId || null,
    sourceType: ctx.sector?.sourceType || null,
    riskZones: ctx.environment?.riskZones || [],
    region: ctx.location.regionId,
    gridCell: ctx.location.gridCell
  }),

  emergency: (ctx) => ({
    hazards: ctx.sector?.hazards || [],
    incidentId: ctx.sector?.incidentId || null,
    region: ctx.location.regionId,
    parcel: ctx.location.parcelId
  }),

  cyber: (ctx) => ({
    threatLevel: ctx.environment?.cyberThreat || "unknown",
    trustZone: ctx.environment?.trustZone || "public",
    activeAlerts: ctx.environment?.alerts || [],
    region: ctx.location.regionId,
    gridCell: ctx.location.gridCell
  }),

  telecom: (ctx) => ({
    towerId: ctx.sector?.towerId || null,
    signalQuality: ctx.environment?.signal || "unknown",
    outageRisk: ctx.environment?.outageRisk || "low",
    region: ctx.location.regionId,
    gridCell: ctx.location.gridCell
  }),

   cloud: (ctx) => ({
    provider: ctx.sector?.provider || "unknown",
    region: ctx.sector?.cloudRegion || null,
    latency: ctx.environment?.latency || null,
    outageRisk: ctx.environment?.cloudOutageRisk || "low",
    trustZone: ctx.environment?.trustZone || "public"
  }),

  water: (ctx) => ({
    systemId: ctx.sector?.systemId || null,
    qualityStatus: ctx.environment?.waterQuality || "unknown",
    region: ctx.location.regionId,
    gridCell: ctx.location.gridCell
  }),

  public_safety: (ctx) => ({
    agency: ctx.sector?.agency || null,
    alertLevel: ctx.environment?.alertLevel || "normal",
    region: ctx.location.regionId,
    gridCell: ctx.location.gridCell
  }),

  health: (ctx) => ({
    facilityId: ctx.sector?.facilityId || null,
    loadLevel: ctx.environment?.loadLevel || "unknown",
    region: ctx.location.regionId
  }),
  
  finance: (ctx) => ({
    marketRegion: ctx.location.regionId,
    riskIndex: ctx.environment?.financialRisk || null
  }),

  education: (ctx) => ({
    institutionType: ctx.sector?.institutionType || null,
    region: ctx.location.regionId
  }),

 network: (ctx) => ({
    asn: ctx.sector?.asn || null,
    routeHealth: ctx.environment?.routeHealth || "unknown",
    dnsIntegrity: ctx.environment?.dnsIntegrity || "unknown",
    region: ctx.location.regionId
  }),
  
 transport: (ctx) => ({
    mode: ctx.sector?.mode || null, // rail, air, road, sea
    corridorId: ctx.sector?.corridorId || null,
    region: ctx.location.regionId,
    gridCell: ctx.location.gridCell
  }),

 climate: (ctx) => ({
    hazardType: ctx.environment?.climateHazard || null,
    severity: ctx.environment?.hazardSeverity || null,
    region: ctx.location.regionId,
    gridCell: ctx.location.gridCell
  }),
  
  space: (ctx) => ({
    orbitClass: ctx.sector?.orbitClass || null, // LEO, MEO, GEO, etc.
    vehicleId: ctx.sector?.vehicleId || null,
    missionPhase: ctx.sector?.missionPhase || null,
    groundRegion: ctx.location.regionId,
    groundGridCell: ctx.location.gridCell
  }) 
};

