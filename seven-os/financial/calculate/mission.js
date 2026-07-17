// seven-os/financial/calculate/mission.js

import { RegionMeta } from "../../regions/region-meta";
import { SectorMeta } from "../../sector/sector-meta";

export function calculateMissionCost(params) {
  const {
    missionId = "unassigned",
    sector,
    region,
    durationMinutes = 0,
    distanceMiles = 0,
    riskLevel = "low",
    materialsCost = 0,
    laborCost = 0
  } = params;

  if (!SectorMeta.exists(sector)) {
    throw new Error(`Sector '${sector}' not recognized`);
  }

  if (!RegionMeta.exists(region)) {
    throw new Error(`Region '${region}' not recognized`);
  }

  const regionMultiplier = RegionMeta.getCostMultiplier(region);
  const sectorMultiplier = SectorMeta.getCostMultiplier(sector);

  const riskMultiplier =
    riskLevel === "critical" ? 2.0 :
    riskLevel === "high"     ? 1.5 :
    riskLevel === "medium"   ? 1.2 :
                               1.0;

  const baseCost =
    durationMinutes * 0.75 +
    distanceMiles * 1.25 +
    materialsCost +
    laborCost;

  const total =
    baseCost *
    regionMultiplier *
    sectorMultiplier *
    riskMultiplier;

  return {
    missionId,
    sector,
    region,
    durationMinutes,
    distanceMiles,
    riskLevel,
    materialsCost,
    laborCost,
    total
  };
}
