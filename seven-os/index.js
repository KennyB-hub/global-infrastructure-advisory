/**
 * GIA v12 GOVERNOR & ORCHESTRATOR
 * Master Entrypoint for Sovereign Infrastructure
 */
// >>> bootstrap TS loader if present (paste at top of seven-os/index.js)
import fs from 'fs';
import path from 'path';

const loaderPath = path.resolve(process.cwd(), 'proprietary-cli', 'ts-loader.js');
if (fs.existsSync(loaderPath)) {
  // dynamic import ensures ESM loader is loaded correctly
  await import(loaderPath);
}

import { runDecisionEngine } from "./ai/decision-engine.js";
import tools from "./ai/tools/index.js";
import policies from "./ai/policy/index.js";
import workflows from "./ai/workflow/index.js";
import { filterAIOutput } from "./ai/filters/code-filter.js";
import { beforeExecution } from "./ai/hooks/before-execution.js";
import { afterExecution } from "./ai/hooks/after-execution.js";
import { validateAIOutput } from "./ai/validation/validator.js";
import { AutomationTasks } from "./system/automation-tasks.js";
import { FailsafeProtocols } from "./system/failsafe-protocols.js";

// NEW API ROUTERS
import { handleCyberApi } from "./system/api/cyber.js";
import { handleGovViewApi } from "./system/api/gov-view.js";
import { handleOpportunityApi } from "./functions/api/opportunity.js";
import { handleMarketplaceApi } from "./system/api/marketplace.js";
import { handleSectorMatchApi } from "./system/api/sector-match.js";

export default {
  // 1. THE HEARTBEAT (Autonomous Cron Trigger)
  async scheduled(event, env, ctx) {
    console.log("[GOVERNOR] Heartbeat Active: Initiating Diagnostics...");
    ctx.waitUntil(AutomationTasks.runDailyOps(env));
  },

  // 2. THE COMMAND INTERFACE (Main Gateway)
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      // ---------------------------------------------------------
      // ROUTING LAYER
      // ---------------------------------------------------------

      if (url.pathname.startsWith("/api/cyber")) {
        return handleCyberApi(request, env);
      }

      if (url.pathname.startsWith("/api/gov/view")) {
        return handleGovViewApi(request, env);
      }

      if (url.pathname.startsWith("/api/opportunities")) {
        return handleOpportunityApi(request, env);
      }

      if (url.pathname.startsWith("/api/marketplace")) {
        return handleMarketplaceApi(request, env);
      }

      if (url.pathname.startsWith("/api/sector/match")) {
        return handleSectorMatchApi(request, env);
      }

      // ---------------------------------------------------------
      // AI / Deep Mind Telemetry Route
      // ---------------------------------------------------------
      if (url.pathname === "/api/deep-mind") {
        const input = await request.json();
        const aiResponse = await runAI(input, env);
        return new Response(JSON.stringify(aiResponse), {
          status: aiResponse.error ? 400 : 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      // ---------------------------------------------------------
      // DEFAULT GOVERNOR STATUS RESPONSE
      // ---------------------------------------------------------
      return new Response("GIA v12 Governor Online | Sovereign Link: STABLE", {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });

    } catch (err) {
      console.error(`[GOVERNOR CRITICAL] ${err.message}`);

      await FailsafeProtocols.execute("GLOBAL", "GOVERNOR_FAULT", env);

      return new Response(
        JSON.stringify({
          error: "Governor Failure",
          details: err.message,
          status: "FAILSAFE_ACTIVE"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  }
};

/**
 * CORE ORCHESTRATION LOGIC
 * Manages TrustZones and AI Lifecycle
 */
async function runAI(input, env) {
  const trustZone = input.trustZone || "public";

  const policy = policies[trustZone];
  if (!policy) return { error: `Invalid TrustZone: ${trustZone}`, trustZone };

  const policyCheck = policy.validate(input);
  if (!policyCheck.valid)
    return { error: "Policy violation", details: policyCheck.errors };

  const startAudit = beforeExecution(input);

  const decisionResult = await runDecisionEngine({
    ...input,
    trustZone,
    workflows,
    tools,
    env
  });

  if (decisionResult.error)
    return { ...decisionResult, audit: { start: startAudit } };

  const rawOutput = decisionResult.output;

  if (!filterAIOutput(rawOutput).valid)
    return { error: "Output blocked by code filter" };

  if (!validateAIOutput(rawOutput).valid)
    return { error: "Schema validation failed" };

  const endAudit = afterExecution(input, rawOutput);

  return {
    success: true,
    trustZone,
    output: rawOutput,
    audit: { start: startAudit, end: endAudit }
  };
}
