/**
 * Deep Mind AI Orchestrator
 * --------------------------
 * Single entrypoint for all AI operations.
 * Wires together:
 *  - decision engine
 *  - policies
 *  - workflows
 *  - tools
 *  - filters
 *  - schema guard
 *  - hooks
 */

import { runDecisionEngine } from "./decision-engine.js";
import tools from "./tools/index.js";
import policies from "./policies/index.js";
import workflows from "./workflow/index.js";
import { filterAIOutput } from "./filters/code-filter.js";
import { beforeExecution } from "./hooks/before-execution.js";
import { afterExecution } from "./hooks/after-execution.js";
import { validateAIOutput } from "./validation/schema-guard.js";

export async function runAI(input) {
    const trustZone = input.trustZone || "public";

    // 1. Policy lookup
    const policy = policies[trustZone];
    if (!policy) {
        return {
            error: `No policy defined for trust zone: ${trustZone}`,
            trustZone
        };
    }

    // 2. Policy validation
    const policyCheck = policy.validate(input);
    if (!policyCheck.valid) {
        return {
            error: "Policy violation",
            details: policyCheck.errors,
            trustZone
        };
    }

    // 3. Before-execution hook (audit start)
    const startAudit = beforeExecution(input);

    // 4. Run decision engine (routes to workflows + tools)
    const decisionResult = await runDecisionEngine({
        ...input,
        trustZone,
        workflows,
        tools
    });

    if (decisionResult.error) {
        return {
            ...decisionResult,
            audit: {
                start: startAudit
            }
        };
    }

    const rawOutput = decisionResult.output;

    // 5. Filter AI output (code filter)
    const filterResult = filterAIOutput(rawOutput);
    if (!filterResult.valid) {
        return {
            error: "Output blocked by code filter",
            details: filterResult.errors,
            trustZone,
            audit: {
                start: startAudit
            }
        };
    }

    // 6. Schema validation
    const schemaResult = validateAIOutput(rawOutput);
    if (!schemaResult.valid) {
        return {
            error: "Schema validation failed",
            details: schemaResult.errors,
            trustZone,
            audit: {
                start: startAudit
            }
        };
    }

    // 7. After-execution hook (audit complete)
    const endAudit = afterExecution(input, rawOutput);

    // 8. Final, safe response
    return {
        success: true,
        trustZone,
        output: rawOutput,
        audit: {
            start: startAudit,
            end: endAudit
        }
    };
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "POST") {
      const input = await request.json();
      // Pass the 'env' so the engine can see your D1 (GLOBAL_DB)
      const result = await runAI({ ...input, env }); 
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" }
      });
    }
    // Static assets (your public folder) are handled automatically by Cloudflare
    return env.ASSETS.fetch(request);
  }
}

import { GIA_IDENTITY } from '../identity.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Log the AI's "thought process" for routing
    console.log(`[CEREBRAL CORTEX] Processing request for: ${url.pathname}`);
    console.log(`[LASSO OF TRUTH] Identity Verified: ${GIA_IDENTITY.name}`);

    // High-level routing logic for your Hubs
    if (url.pathname.startsWith('/government-hub')) {
      return new Response("Government 3D Strategic Mapping Active.", { status: 200 });
    }
    
    if (url.pathname.startsWith('/farmer-hub')) {
      return new Response("Agri-Tech Hub: Food Security Protocol Online.", { status: 200 });
    }

    // Default to the Public Space-Grade UI
    return fetch(request);
  }
};
