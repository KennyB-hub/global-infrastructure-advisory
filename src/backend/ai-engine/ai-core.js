// backend/ai-engine/ai-core.js

import { basicSecurityGuard } from "../backend/security/worker-guard.js";
import { routeAIRequest } from "./ai-router.js"
import { applyPolicies } from "./policy-engine.js"
import { buildContext } from "./context-builder.js"
import { sanitizeOutput } from "./response-sanitizer.js"
import { handleError } from "./error-handler.js"

function enforceTrustZone(payload) {
  const zone = payload.trustZone || "public";

  if (zone === "deepgov" || zone === "gov") {
    if (!payload.identityHash) {
      throw new Error("Identity anchor required for high-trust zones");
    }
  }

  return zone;
}
export async function processAIRequest(input) {

  try {
    const sec = basicSecurityGuard(request);
    if (sec) return sec;
    // Build context for the request
    const context = await buildContext(input, env)

    // Apply enterprise policies
    const validated = await applyPolicies(input, context)

    // Route to the correct AI module
    const result = await routeAIRequest({ ...validated, env }, context)

    // Clean and sanitize output
    return sanitizeOutput(result)

  } catch (err) {
    return handleError(err)
  }
}

