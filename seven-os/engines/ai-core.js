// /ai-engine/ai-core.js
// /ai-engine/process-ai-request.js
// GIA Sovereign AI Request Processor – V12 Alpha

import { basicSecurityGuard } from "../system/security/worker-guard.js";
import { routeAIRequest } from "../ai/ai-router.js";
import { applyPolicies } from "../system/policy-engine.js";
import { buildContext } from "./context-builder.js";
import { sanitizeOutput } from "./response-sanitizer.js";
import { handleError } from "./error-handler.js";
import { validatePayload, validateTrustZone } from "../ai/validation/validator.js";

export async function processAIRequest(request, env) {
  try {
    //
    // 1. Security guard (rate limits, IP checks, threat signals)
    //
    const sec = basicSecurityGuard(request, env);
    if (sec) return sec;

    //
    // 2. Parse JSON input
    //
    let input;
    try {
      input = await request.json();
    } catch (err) {
      return handleError(new Error("Invalid JSON body"), env);
    }

    //
    // 3. Validate payload schema
    //
    const schemaCheck = await validatePayload(env, input, {
      text: { required: true, type: "string" },
      trustZone: { required: false, type: "string" },
      workflow: { required: false, type: "string" },
      identityHash: { required: false, type: "string" }
    });
    if (!schemaCheck.ok) return schemaCheck;

    //
    // 4. Enforce trust‑zone rules
    //
    const zone = input.trustZone || "public";
    const trustCheck = await validateTrustZone(env, zone, 1);
    if (!trustCheck.ok) return trustCheck;

    if ((zone === "gov" || zone === "deepgov") && !input.identityHash) {
      return handleError(
        new Error("Identity anchor required for high-trust zones"),
        env,
        { trustZone: zone }
      );
    }

    //
    // 5. Build sovereign execution context
    //
    const context = await buildContext(input, env);

    //
    // 6. Apply enterprise policies (rate limits, workflow rules, sector rules)
    //
    const validated = await applyPolicies(input, context);
    if (!validated.ok && validated.error) return validated;

    //
    // 7. Route to correct AI module (geo, utility, decision, sandbox, etc.)
    //
    const result = await routeAIRequest(
      { ...validated, env },
      context
    );

    //
    // 8. Sanitize output (sovereign safety membrane)
    //
    const sanitized = await sanitizeOutput(result, env, context);

    //
    // 9. Return sovereign‑grade AI response
    //
    return sanitized;

  } catch (err) {
    //
    // 10. Sovereign error handling
    //
    return handleError(err, env, { fatal: true });
  }
}
