import { IntegrityDrone } from "../utilities/integrity/index.js";
import { TrustZoneEngine } from "../trust/engine.js";
import { CloudPolicies } from "./cloud-policies.js";
import { RoutingEngine } from "../network/routing-engine.js";

export class PolicyEngine {
  static evaluate(ctx) {
    const warnings = [];
    let allowed = true;

    // Base rule example
    if (ctx.location.regionId === "UNKNOWN_REGION") {
      warnings.push("Unknown region — limited intelligence");
    }

    // 1. Build initial result object
    let result = {
      allowed,
      warnings,
      recommendedAction: null,
      recommendedRate: null
    };

    // 2. Apply Trust‑Zone Engine
    const trust = TrustZoneEngine.classify(ctx);
    result.trustZone = trust.zone;
    result.trustReason = trust.reason;

    if (trust.zone === "restricted") {
      result.warnings.push("Restricted trust zone — actions may be limited");
    }

    // 3. Apply Cloud Policy Pack
    result = CloudPolicies.apply(ctx, result);

    // 4. Apply Global Routing Intelligence
    const routing = RoutingEngine.evaluate(ctx);
    result.routing = routing;

    if (routing.routeHealth === "degraded") {
      result.warnings.push("Global routing degraded — expect instability");
    }

    if (routing.dnsIntegrity === "suspicious") {
      result.warnings.push("DNS integrity suspicious — verify endpoints");
    }

    // 5. Integrity Drone (final snapshot)
    IntegrityDrone.enqueue({
      type: "policyDecision",
      data: {
        ctxSummary: {
          location: ctx.location,
          sector: ctx.sector
        },
        result
      }
    });

    // 6. Return final governed result
    return result;
  }
}
