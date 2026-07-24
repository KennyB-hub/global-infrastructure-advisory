// policy-validator.ts – V12 Alpha
// Validates globalPolicy, sovereignOverrides, trustZones, and manifest integrity.

import { SovereignPolicyBundle } from "./sovereign-policy-loader.js";

export class PolicyValidator {
  static validate(bundle: SovereignPolicyBundle): { ok: boolean; errors: string[] } {
    const errors: string[] = [];

    // -------------------------------
    // 1. Validate manifest
    // -------------------------------
    if (!bundle.manifest.manifestVersion) {
      errors.push("Manifest missing manifestVersion");
    }

    if (!bundle.manifest.rootPacks) {
      errors.push("Manifest missing rootPacks");
    }

    // -------------------------------
    // 2. Validate trust zones
    // -------------------------------
    if (!Array.isArray(bundle.trustZones) || bundle.trustZones.length === 0) {
      errors.push("trustZones.json missing or empty");
    }

    // -------------------------------
    // 3. Validate global policy
    // -------------------------------
    if (!bundle.global) {
      errors.push("globalPolicy.json missing");
    }

    // -------------------------------
    // 4. Validate overrides
    // -------------------------------
    if (!bundle.overrides) {
      errors.push("sovereignOverrides.json missing");
    }

    // -------------------------------
    // 5. Validate merged policy
    // -------------------------------
    if (!bundle.merged) {
      errors.push("Merged policy object missing");
    }

    return {
      ok: errors.length === 0,
      errors
    };
  }
}
