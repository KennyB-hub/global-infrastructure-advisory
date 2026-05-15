import { SovereignPolicyPacks } from "./packs/index.js";
import marketplacePolicies from "../../data/marketplace/policies/index.json" assert { type: "json" };

export class PolicyLoader {
  static loadAll() {
    return {
      ...SovereignPolicyPacks,
      ...marketplacePolicies
    };
  }

  static loadPolicy(id) {
    const all = PolicyLoader.loadAll();
    return all[id] || null;
  }
}
