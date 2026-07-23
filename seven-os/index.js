// seven-os/index.js
// Seven‑OS Sovereign Router – Unified Entrypoint

import fs from "fs";
import path from "path";

// ─────────────────────────────────────────────────────────────
// Optional TS Loader (your original logic)
// ─────────────────────────────────────────────────────────────

const loaderPath = path.resolve(process.cwd(), "proprietary-cli", "ts-loader.js");
if (fs.existsSync(loaderPath)) {
  await import(loaderPath);
}

// ─────────────────────────────────────────────────────────────
// Seven‑OS Governors
// ─────────────────────────────────────────────────────────────

import { runEnterpriseDecision } from "./platform/enterprise-decision-engine.js";
import { runDecisionEngine } from "./ai/decision-engine.js";

// AI Subsystems
import tools from "./ai/tools/index.js";
import policies from "./ai/policies/index.js";
import workflows from "./ai/workflow/index.js";
import { filterAIOutput } from "./ai/filters/code-filter.js";
import { beforeExecution } from "./ai/hooks/before-execution.js";
import { afterExecution } from "./ai/hooks/after-execution.js";
import { validateAIOutput } from "./ai/validation/schema-guard.js";

// System Subsystems
import { AutomationTasks } from "./system/automation-tasks.js";
import { FailsafeProtocols } from "./system/failsafe-protocols.js";

// API Routers
import { handleCyberApi } from "./system/api/cyber.js";
import { handleGovViewApi } from "./system/api/gov-view.js";
import { handleOpportunityApi } from "./functions/api/opportunity.js";
import { handleMarketplaceApi } from "./system/api/marketplace.js";
import { handleSectorMatchApi } from "./system/api/sector-match.js";

// ─────────────────────────────────────────────────────────────
// Seven‑OS Route Classifier
// ─────────────────────────────────────────────────────────────

function classifyRoute(input) {
  if (!input || !input.route) return "enterprise";

  const r = String(input.route).toLowerCase();

  if (r.startsWith("ai")) return "ai";
  if (r.startsWith("api")) return "api";

  return "enterprise";
}

// ─────────────────────────────────────────────────────────────
// Sovereign Router
// ─────────────────────────────────────────────────────────────

export async function sevenRouter(input = {}, env = {}) {
  const route = classifyRoute(input);

  switch (route) {
    case "ai":
      return await runAI(input, env);

    case "api":
      return await routeApi(input, env);

    case "enterprise":
    default:
      return await runEnterpriseDecision(input, env);
  }
}

// ─────────────────────────────────────────────────────────────
// API Routing Layer (your original Worker fetch logic)
// ─────────────────────────────────────────────────────────────

async function routeApi(input, env) {
  const { pathname } = new URL(input.url);

  if (pathname.startsWith("/api/cyber")) return handleCyberApi(input, env);
  if (pathname.startsWith("/api/gov/view")) return handleGovViewApi(input, env);
  if (pathname.startsWith("/api/opportunities")) return handleOpportunityApi(input, env);
  if (pathname.startsWith("/api/marketplace")) return handleMarketplaceApi(input, env);
  if (pathname.startsWith("/api/sector/match")) return handleSectorMatchApi(input, env);

  return { status: "API_ROUTE_NOT_FOUND" };
}

// ─────────────────────────────────────────────────────────────
// AI Orchestration (your original logic)
// ─────────────────────────────────────────────────────────────

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
