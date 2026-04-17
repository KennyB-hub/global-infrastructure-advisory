/**
 * GIA CEREBRAL CORTEX (Deep Mind AI Orchestrator)
 * ----------------------------------------------
 * Single entrypoint for all AI operations and Hub Routing.
 * Respects GIA Repository Governance & Lasso of Truth.
 */

import { GIA_IDENTITY } from '../identity.js';
import { runDecisionEngine } from "./decision-engine.js";
import tools from "./tools/index.js";
import policies from "./policies/index.js";
import workflows from "./workflow/index.js";
import { filterAIOutput } from "./filters/code-filter.js";
import { beforeExecution } from "./hooks/before-execution.js";
import { afterExecution } from "./hooks/after-execution.js";
import { validateAIOutput } from "./validation/schema-guard.js";

/**
 * Core AI Logic (The Brain)
 */
export async function runAI(input) {
    const trustZone = input.trustZone || "public";
    const policy = policies[trustZone];

    if (!policy) {
        return { error: `No policy defined for: ${trustZone}`, trustZone };
    }

    const policyCheck = policy.validate(input);
    if (!policyCheck.valid) {
        return { error: "Policy violation", details: policyCheck.errors, trustZone };
    }

    const startAudit = beforeExecution(input);

    const decisionResult = await runDecisionEngine({
        ...input,
        trustZone,
        workflows,
        tools
    });

    if (decisionResult.error) {
        return { ...decisionResult, audit: { start: startAudit } };
    }

    const rawOutput = decisionResult.output;

    const filterResult = filterAIOutput(rawOutput);
    if (!filterResult.valid) {
        return { error: "Output blocked by code filter", trustZone, audit: { start: startAudit } };
    }

    const schemaResult = validateAIOutput(rawOutput);
    if (!schemaResult.valid) {
        return { error: "Schema validation failed", trustZone, audit: { start: startAudit } };
    }

    const endAudit = afterExecution(input, rawOutput);

    return {
        success: true,
        identity: GIA_IDENTITY.name,
        output: rawOutput,
        audit: { start: startAudit, end: endAudit }
    };
}

/**
 * Worker Fetch Handler (The Hub Router)
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Handle AI API Calls (POST)
    if (request.method === "POST") {
      const input = await request.json();
      const result = await runAI({ ...input, env }); 
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. Handle Hub Routing (GET)
    console.log(`[CEREBRAL CORTEX] Routing: ${url.pathname}`);
    
    if (url.pathname.startsWith('/government-hub')) {
      return env.ASSETS.fetch(new Request(`${url.origin}/government-hub/index.html`, request));
    }
    
    if (url.pathname.startsWith('/farmer-hub')) {
      return env.ASSETS.fetch(new Request(`${url.origin}/farmer-hub/index.html`, request));
    }

    if (url.pathname.startsWith('/contractors-hub')) {
      return env.ASSETS.fetch(new Request(`${url.origin}/contractors-hub/index.html`, request));
    }

    if (url.pathname.startsWith('/public-hub')) {
      return env.ASSETS.fetch(new Request(`${url.origin}/public-hub/index.html`, request));
    }

    // 3. Fallback to main Space-Grade UI
    return env.ASSETS.fetch(request);
  }
};

