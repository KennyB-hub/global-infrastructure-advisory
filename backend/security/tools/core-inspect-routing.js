// src/backend/security/tools/inspect-routing.js

import { makeOk, makeError } from "src/backend/utils/context.js";
import { parseEndpoint } from "src/backend/infrastructure/utils/parse-endpoint.js";

export async function inspectRouting(url, cf, ai) {
  try {
    const parsed = parseEndpoint(url);
    const trustHint = cf?.colo || "unknown";

    const result = {
      endpoint: parsed,
      colo: cf?.colo || null,
      country: cf?.country || null,
      asn: cf?.asn || null,
      aiSurface: !!ai,
      trustHint
    };

    return makeOk(result, { AI: ai });
  } catch (err) {
    return makeError("Routing inspection failed", { AI: ai }, { message: err.message, url });
  }
}
