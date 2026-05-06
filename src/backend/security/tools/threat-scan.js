// src/backend/security/tools/threat-scan.js

import { makeOk } from "src/backend/utils/context.js";

export async function threatScan(cf, ai) {
  const signals = {
    ip: cf?.ip || null,
    country: cf?.country || null,
    asn: cf?.asn || null,
    colo: cf?.colo || null
  };

  // Placeholder heuristic
  const riskLevel = signals.country === "RU" || signals.country === "KP" ? "medium" : "low";

  return makeOk(
    {
      riskLevel,
      signals,
      aiSurface: !!ai
    },
    { AI: ai }
  );
}
