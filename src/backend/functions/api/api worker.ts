// src/backend/ai/api-worker.js

import { runDecisionEngine } from "../../../ai/decision-engine.js";
import { Cortex } from "../../ai/cortex.js";

import { verifyTrustZone } from "../../system/trust.js";
import { applyPolicy } from "../../../system/policy-engine.js";
import { applyCodeFilter } from "../../system/code-filter.js";
import { buildAIContext } from "../../../system/ai-context.js";
import { computeIntegrityHash } from "../../system/integrity.js";

import nodeRegistry from "../../config/node-registry.json" assert { type: "json" };

export async function runApiWorker(task) {
  const { text, role, sessionId, sensors, resources } = task;

  // 1. Trust Zone Enforcement
  const trust = await verifyTrustZone(role, nodeRegistry);
  if (!trust.allowed) {
    return { error: "Trust zone violation", details: trust };
  }

  // 2. Policy Enforcement
  const policy = await applyPolicy({ text, role });
  if (!policy.allowed) {
    return { error: "Policy violation", details: policy };
  }

  // 3. Code Filter
  const filtered = await applyCodeFilter(text);

  // 4. Build AI Context
  const context = await buildAIContext({
    text: filtered,
    role,
    sessionId,
    sensors,
    resources
  });

  // 5. Decision Engine
  const decision = await runDecisionEngine(context);

  // 6. Cortex Execution (optional)
  const cortex = new Cortex();
  const result = await cortex.process(decision);

  // 7. Integrity Hash
  const integrity = computeIntegrityHash(result);

  return {
    ok: true,
    decision,
    result,
    integrity
  };
}
