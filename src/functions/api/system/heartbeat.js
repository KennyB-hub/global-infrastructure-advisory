// 2050 V12 Alpha — System Heartbeat
// Global Infrastructure Platform — Sovereign Diagnostics

import { requireRole } from "../../../system/trust/api-trust.js";
import { buildSovereignMetadata } from "../../../system/metadata.js";
import { computeIntegrityHash } from "../../../system/integrity.js";
import { applyPolicy } from "../../../system/policy-engine.js";
import { buildAIContext } from "../../../system/ai-context.js";

import { runAITask } from "../../../system/ai-worker.js";
import { embedText } from "../../../system/ai-embedding.js";
import { rememberShortTerm, recallShortTerm } from "../../../system/ai-memory.js";
import { checkAISafety } from "../../../system/ai-safety.js";
import { KeyEngine } from "../../system/security/key-engine.js";
import { dbQuery } from "../../system/db/db-access.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const path = "/api/system/heartbeat";
  const keyEngine = new KeyEngine(env);

  // ---------------------------------------------------------
  // 1. Sovereign Metadata
  // ---------------------------------------------------------
  const sovereign = buildSovereignMetadata({
    api: "system-heartbeat",
    version: "2050.V12A",
    node: env.NODE_ID,
    cluster: env.CLUSTER_ID,
    path,
    method: "GET"
  });

  // ---------------------------------------------------------
  // 2. Trust‑Zone Enforcement (system-level)
  // ---------------------------------------------------------
  const trust = requireRole("system", request, env);
  if (!trust.allowed) return trust.response;

  // ---------------------------------------------------------
  // 3. Policy Engine Enforcement
  // ---------------------------------------------------------
  const policy = applyPolicy({ request, path, zone: "system" });
  if (!policy.allowed) {
    return sovereignError("POLICY_BLOCKED", policy.reason, sovereign);
  }

  // ---------------------------------------------------------
  // 4. AI Context
  // ---------------------------------------------------------
  const ai = buildAIContext({
    request,
    path,
    workflow: "system-heartbeat",
    trustZone: "system"
  });

  // ---------------------------------------------------------
  // 5. Diagnostics Container
  // ---------------------------------------------------------
  const diagnostics = {
    db: null,
    ai_worker: null,
    ai_cortex: null,
    ai_embedding: null,
    ai_memory: null,
    ai_safety: null,
    timestamp: Date.now()
  };

  // ---------------------------------------------------------
  // 6. DB Check
  // ---------------------------------------------------------
  try {
    await env.DB.prepare("SELECT 1").first();
    diagnostics.db = "ok";
  } catch (err) {
    diagnostics.db = "error";
  }

  // ---------------------------------------------------------
  // 7. AI Worker Check
  // ---------------------------------------------------------
  try {
    const result = await runAITask({
      task: { type: "decision", input: { priority: "low" } },
      context: ai
    });
    diagnostics.ai_worker = result.ok ? "ok" : "error";
  } catch {
    diagnostics.ai_worker = "error";
  }

  // ---------------------------------------------------------
  // 8. AI Cortex Check (Deep Mind)
  // ---------------------------------------------------------
  try {
    const result = await env.AI.run("@cf/google/gemma-4-26b-a4b-it", {
      prompt: "ping",
      max_tokens: 8
    });
    diagnostics.ai_cortex = result?.response ? "ok" : "error";
  } catch {
    diagnostics.ai_cortex = "error";
  }

  // ---------------------------------------------------------
  // 9. Embedding Engine Check
  // ---------------------------------------------------------
  try {
    const embed = await embedText(env, "ping");
    diagnostics.ai_embedding = embed.ok ? "ok" : "error";
  } catch {
    diagnostics.ai_embedding = "error";
  }

  // ---------------------------------------------------------
  // 10. Memory Engine Check
  // ---------------------------------------------------------
  try {
    rememberShortTerm(ai.ai.contextId, "heartbeat");
    const mem = recallShortTerm(ai.ai.contextId);
    diagnostics.ai_memory = mem.length > 0 ? "ok" : "error";
  } catch {
    diagnostics.ai_memory = "error";
  }

  // ---------------------------------------------------------
  // 11. Safety Engine Check
  // ---------------------------------------------------------
  try {
    const safe = checkAISafety("normal text");
    diagnostics.ai_safety = safe.safe ? "ok" : "error";
  } catch {
    diagnostics.ai_safety = "error";
  }

  // ---------------------------------------------------------
  // 12. Build Payload
  // ---------------------------------------------------------
  const payload = {
    heartbeat: "alive",
    diagnostics,
    timestamp: Date.now()
  };

  // ---------------------------------------------------------
  // 13. Sovereign Success Response
  // ---------------------------------------------------------
  return new Response(
    JSON.stringify({
      ok: true,
      payload,
      sovereign,
      ai,
      integrity: computeIntegrityHash(payload)
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

// ---------------------------------------------------------
// Unified Error Model
// ---------------------------------------------------------
function sovereignError(code, message, sovereign, status = 400) {
  return new Response(
    JSON.stringify({
      ok: false,
      error: { code, message },
      sovereign,
      integrity: computeIntegrityHash({ code, message })
    }),
    { status, headers: { "Content-Type": "application/json" } }
  );
}
