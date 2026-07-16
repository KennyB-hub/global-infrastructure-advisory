// seven-os/financial/calculate/contractor.js

import { calculate } from "./calculate.js";
import { calculateMaterialsCost } from "./materials.js";

/**
 * Universal contractor cost model for ALL infrastructure sectors.
 */
export function calculateContractorCost(params = {}) {
  const {
    contractorId = "unknown",
    sector = "general",
    region = "global",

    laborHours = 0,
    laborRate = 45,

    equipmentHours = 0,
    equipmentRate = 65,

    materials = [],

    dispatchFee = 25,
    complianceFee = 15,

    risk = "low",
    multipliers = {}
  } = params;

  const materialsResult = calculateMaterialsCost(materials);

  const base =
    laborHours * laborRate +
    equipmentHours * equipmentRate +
    materialsResult.total +
    dispatchFee +
    complianceFee;

  const result = calculate({
    base,
    laborHours,
    materialsCost: materialsResult.total,
    risk,
    sector,
    region,
    multipliers
  });

  return {
    contractorId,
    sector,
    region,
    laborHours,
    equipmentHours,
    materials: materialsResult.breakdown,
    dispatchFee,
    complianceFee,
    risk,
    multipliers,
    total: result.total,
    breakdown: {
      labor: laborHours * laborRate,
      equipment: equipmentHours * equipmentRate,
      materials: materialsResult.total,
      dispatch: dispatchFee,
      compliance: complianceFee,
      subtotal: result.subtotal
    }
  };
}
