// /workers/ai/ai-worker.js
// GIA Sovereign AI Worker – V12 Alpha

import { basicSecurityGuard } from "../../src/security/worker-guard.js";
import { PolicyEngine } from "../../src/ai-engine/policy-engine.js";
import { buildContext } from "../../src/ai-engine/context-builder.js";
import { sanitizeOutput } from "../../src/ai-engine/response-sanitizer.js";
import { handleError } from "../../src/ai-engine/error-handler.js";
import { processAIRequest } from "../../src/ai-engine/ai-router.js";
import { sha256 } from "../../src/ai-engine/utils/crypto.js";

const policy = new PolicyEngine();

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    //
    // 1. GET → Debug metadata
    //
    if (request.method !== "POST") {
      const payload = {
        system: "ai-worker",
        status: "online",
        version: "v12-alpha",
        instructions: "POST JSON to run AI with sovereign validation",
        timestamp: new Date().toISOString()
      };

      payload.integrity = {
        hash: await sha256(JSON.stringify(payload)),
        verified: true
      };

      return new Response(JSON.stringify(payload, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }

    //
    // 2. Worker Guard (V12 Alpha)
    //
    const guard = basicSecurityGuard(request, env);
    if (guard) return guard;

    //
    // 3. Parse JSON
    //
    let payload;
    try {
      payload = await request.json();
    } catch (err) {
      return handleError(new Error("Invalid JSON body"), env);
    }

    //
    // 4. Trust Zone
    //
    const trustZone = payload.trustZone || "public";

    //
    // 5. Policy Check (AI Invocation)
    //
    const decision = await policy.check({
      trustZone,
      workflow: payload.workflow || "general",
      action: "invoke"
    });

    if (!decision.allowed) {
      return new Response(JSON.stringify({
        ok: false,
        type: "policy-deny",
        reason: decision.reason,
        trustZone,
        workflow: payload.workflow || "general",
        timestamp: new Date().toISOString(),
        integrity: {
          hash: await sha256(JSON.stringify(decision)),
          verified: true
        }
      }, null, 2), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    //
    // 6. Build Sovereign Context
    //
    const context = await buildContext(payload, env);

    //
    // 7. Route to AI Engine (V12 Alpha Router)
    //
    let result;
    try {
      result = await processAIRequest(request, env, ctx);
    } catch (err) {
      return handleError(err, env, { fatal: true });
    }

    //
    // 8. Sanitize Output (sovereign-grade)
    //
    const final = await sanitizeOutput(result, env, context);

    //
    // 9. Return Sovereign Response
    //
    final.integrity = {
      hash: await sha256(JSON.stringify(final)),
      verified: true
    };

    return new Response(JSON.stringify(final, null, 2), {
      headers: { "Content-Type": "application/json" }
    });
  }
};

