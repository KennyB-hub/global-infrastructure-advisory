// /workers/ai/ai-worker.js
// GIA Sovereign AI Worker – V12 Alpha

import { basicSecurityGuard } from "../../src/security/worker-guard.js";
import { PolicyEngine } from "../../src/ai-engine/policy-engine.js";
import { enforceAIPolicy } from "../../src/ai-engine/enforce-ai-policy.js";
import { buildContext } from "../../ai-engine/context-builder.js";
import { sanitizeOutput } from "../../ai-engine/response-sanitizer.js";
import { handleError } from "../../ai-engine/error-handler.js";
import { processAIRequest } from "../../ai-engine/ai-router.js";
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
    const workflow = payload.workflow || "general";

    //
    // 5. AI‑Policy (Sovereign Enforcement + Cyber Logging)
    //
    const aiPolicy = await enforceAIPolicy({
      trustZone,
      workflow,
      request,
      env
    });

    if (!aiPolicy.allowed) {
      return new Response(JSON.stringify({
        ok: false,
        type: "policy-deny",
        reason: aiPolicy.reason,
        trustZone,
        workflow,
        timestamp: new Date().toISOString(),
        integrity: {
          hash: await sha256(JSON.stringify(aiPolicy)),
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
