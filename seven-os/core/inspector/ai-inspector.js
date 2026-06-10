// autonomous/seven/core/inspector/ai-inspector.js

import { getItemById } from "../mci/index.js";
import { validateZoningAndLandUse } from "../landuse/zoning-landuse.js";

export function inspect(action) {
  const { targetId, type, payload } = action;

  const result = getItemById(targetId);
  if (!result) {
    return { allowed: false, reason: "Unknown asset", flags: ["unknown"] };
  }

  const { item, sector } = result;

  // 1. Zoning + Land Use
  const zoning = validateZoningAndLandUse(targetId);
  if (!zoning.allowed) {
    return {
      allowed: false,
      reason: "Zoning/Land Use violation",
      flags: ["zoning"],
      details: zoning.reason
    };
  }

  // 2. Governance Rules (MCI-driven)
  if (item.status === "planned" && type === "activate") {
    return {
      allowed: false,
      reason: "Governance: cannot activate planned asset",
      flags: ["governance"]
    };
  }

  // 3. Drone Inspection Data
  if (payload?.inspection && payload.inspection.structuralRisk > 0.7) {
    return {
      allowed: false,
      reason: "Drone inspection: structural risk too high",
      flags: ["inspection"]
    };
  }

  // 4. Supply Chain Audit
  if (sector === "supply-chain" && item.quantity > 100000) {
    return {
      allowed: false,
      reason: "Overstock: supply exceeds threshold",
      flags: ["supply"]
    };
  }

  return { allowed: true, reason: "All checks passed", flags: [] };
}
