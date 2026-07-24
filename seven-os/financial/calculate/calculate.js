// seven-os/financial/calculate/calculate.js

import { RegionMeta } from "../../regions/region-meta";
import { SectorMeta } from "../../sector/sector-meta";

/**
 * Universal math engine for ALL infrastructure sectors.
 * Deterministic, auditable, and compatible with Seven‑OS.
 */
export function calculate(params = {}) {
  const {
    base = 0,

    // Universal mission parameters
    durationMinutes = 0,
    distanceMiles = 0,
    payloadKg = 0,
    energyKwh = 0,
    laborHours = 0,
    materialsCost = 0,

    // Infrastructure modifiers
    risk = "low",
    sector = "general",
    region = "global",

    // Custom multipliers (sector-specific)
    multipliers = {}
  } = params;

  // Sector + region multipliers
  const regionMult = RegionMeta.getCostMultiplier(region) || 1.0;
  const sectorMult = SectorMeta.getCostMultiplier(sector) || 1.0;

  // Risk multiplier
  const riskMult =
    risk === "critical" ? 2.0 :
    risk === "high"     ? 1.5 :
    risk === "medium"   ? 1.2 :
                          1.0;

  // Custom multipliers (pipeline, telecom, water, etc.)
  const customMult = Object.values(multipliers).reduce(
    (acc, v) => acc * (v || 1.0),
    1.0
  );

  // Universal subtotal
  const subtotal =
    base +
    durationMinutes * 0.75 +
    distanceMiles * 1.25 +
    payloadKg * 0.5 +
    energyKwh * 0.2 +
    laborHours * 45 +
    materialsCost;

  // Final cost
  const total =
    subtotal *
    regionMult *
    sectorMult *
    riskMult *
    customMult;

  return {
    subtotal,
    regionMult,
    sectorMult,
    riskMult,
    customMult,
    total
  };
}
