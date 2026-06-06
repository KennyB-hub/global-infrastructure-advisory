import commonRule from "./sovereign/common-rule.json" assert { type: "json" };
import dhsCompliance from "./sovereign/dhs-compliance.json" assert { type: "json" };
import ncesEthics from "./sovereign/nces-ethics.json" assert { type: "json" };
import ogeMisconduct from "./sovereign/oge-misconduct.json" assert { type: "json" };
import ombM1406 from "./sovereign/omb-m14-06.json" assert { type: "json" };
import ombM2012 from "./sovereign/omb-m20-12.json" assert { type: "json" };
import ostpIntegrity from "./sovereign/ostp-scientific-integrity.json" assert { type: "json" };

export const SovereignPolicyPacks = {
  "common-rule": commonRule,
  "dhs-compliance": dhsCompliance,
  "nces-ethics": ncesEthics,
  "oge-misconduct": ogeMisconduct,
  "omb-m14-06": ombM1406,
  "omb-m20-12": ombM2012,
  "ostp-scientific-integrity": ostpIntegrity
};
