// seven-os/policy/sovereign-policy.ts
// Sovereign policy loader + expansion validator.

import globalPolicy from "../../config/global-policy.json";
import sovereignOverrides from "../config/sovereignOverrides.json";
import trustZones from "../config/trustZones.json";

export class SovereignPolicy {
  private env: any;

  constructor(env: any) {
    this.env = env;
  }

  async loadPolicies(): Promise<any> {
    // In reality you might merge DB + files + overrides
    return {
      globalPolicy,
      sovereignOverrides,
      trustZones: trustZones.trustZones || [
        "PUBLIC",
        "ENTERPRISE",
        "SOVEREIGN",
        "CRITICAL_INFRA",
        "EXPERIMENTAL"
      ]
    };
  }

  async validateExpansionRequest(payload: any): Promise<{ allowed: boolean; reason?: string }> {
    const policies = await this.loadPolicies();

    // Example hard stops from your spec:
    if (payload.newOrg && policies.globalPolicy.requireHumanApprovalForNewOrgs) {
      return { allowed: false, reason: "Human approval required for new orgs" };
    }

    if (payload.newSovereignZone && policies.globalPolicy.requireHumanApprovalForNewSovereignZones) {
      return { allowed: false, reason: "Human approval required for new sovereign zones" };
    }

    // TODO: add more detailed checks (jurisdiction, trustZone, etc.)
    return { allowed: true };
  }
}
