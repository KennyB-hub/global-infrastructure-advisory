import { IntegrityDrone } from "../utilities/integrity/index.js";

export class PolicyEngine {
  static evaluate(ctx) {
    const warnings = [];
    let allowed = true;

    if (ctx.location.regionId === "UNKNOWN_REGION") {
      warnings.push("Unknown region — limited intelligence");
    }

    const result = {
      allowed,
      warnings,
      recommendedAction: null,
      recommendedRate: null
    };

    IntegrityDrone.enqueue({
      type: "policyDecision",
      data: { ctxSummary: { location: ctx.location, sector: ctx.sector }, result }
    });

    return result;
  }
}
