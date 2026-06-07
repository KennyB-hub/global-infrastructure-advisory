// Sovereign Policy Loader – V12 Alpha
// Loads globalPolicy.json, sovereignOverrides.json, and trustZones.json
// Produces a unified, validated sovereign policy object.

import globalPolicy from "./globalPolicy.json";
import sovereignOverrides from "./sovereignOverrides.json";
import trustZones from "./trustZones.json";
import manifest from "./policy-manifest.json";

export interface SovereignPolicyBundle {
  manifest: any;
  global: any;
  overrides: any;
  trustZones: string[];
  merged: any;
}

export class SovereignPolicyLoader {
  static async load(): Promise<SovereignPolicyBundle> {
    // -------------------------------
    // 1. Load root packs
    // -------------------------------
    const globalPack = globalPolicy;
    const overridePack = sovereignOverrides;
    const tzPack = trustZones;

    // -------------------------------
    // 2. Validate trust zones
    // -------------------------------
    const trustZoneList = tzPack?.trustZones || [];
    if (!Array.isArray(trustZoneList) || trustZoneList.length === 0) {
      throw new Error("Invalid trustZones.json: trustZones array missing or empty");
    }

    // -------------------------------
    // 3. Merge global + overrides
    // -------------------------------
    const merged = {
      ...globalPack,
      ...overridePack,
      trustZones: trustZoneList
    };

    // -------------------------------
    // 4. Validate manifest integrity
    // -------------------------------
    if (!manifest || !manifest.rootPacks) {
      throw new Error("policy-manifest.json is missing or invalid");
    }

    // -------------------------------
    // 5. Return unified bundle
    // -------------------------------
    return {
      manifest,
      global: globalPack,
      overrides: overridePack,
      trustZones: trustZoneList,
      merged
    };
  }
}
