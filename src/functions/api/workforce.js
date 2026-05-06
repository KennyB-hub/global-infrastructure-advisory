// 2050 V12 Alpha — Workforce Listing Engine
// Global Infrastructure Platform — Workforce Data Layer

import { requireRole } from "../../system/trust/api-trust.js";
import { buildSovereignMetadata } from "../../system/metadata.js";
import { computeIntegrityHash } from "../../system/integrity.js";
import { applyPolicy } from "../../system/policy-engine.js";
import { buildAIContext } from "../../system/ai-context.js";

export async function listWorkforce(request, env) {
  const path = "/api/workforce/list";

  // ---------------------------------------------------------
  // 1. Sovereign Metadata
  // ---------------------------------------------------------
  const sovereign = buildSovereignMetadata({
    api: "workforce-list",
    version: "2050.V12A",
    node: env?.NODE_ID,
    cluster: env?.CLUSTER_ID,
    path,
    method: request?.method || "SYSTEM"
  });

  // ---------------------------------------------------------
  // 2. Trust‑Zone Enforcement (admin-level)
  // ---------------------------------------------------------
  const trust = requireRole("admin", request, env);
  if (!trust.allowed) return trust.response;

  // ---------------------------------------------------------
  // 3. Policy Engine Enforcement
  // ---------------------------------------------------------
  const policy = applyPolicy({
    request,
    path,
    zone: "admin"
  });

  if (!policy.allowed) {
    return sovereignError("POLICY_BLOCKED", policy.reason, sovereign);
  }

  // ---------------------------------------------------------
  // 4. AI Context
  // ---------------------------------------------------------
  const ai = buildAIContext({
    request,
    path,
    workflow: "workforce-list",
    trustZone: "admin"
  });

  // ---------------------------------------------------------
  // 5. Execute DB Query Safely
  // ---------------------------------------------------------
  let workforce = [];
  try {
    const stmt = await env.DB.prepare("SELECT * FROM contractors");
    const data = await stmt.all();
    workforce = data.results || [];
  } catch (err) {
    return sovereignError("DB_ERROR", err.message, sovereign);
  }

  // ---------------------------------------------------------
  // 6. Payload
  // ---------------------------------------------------------
  const payload = {
    count: workforce.length,
    workforce,
    timestamp: Date.now()
  };

  // ---------------------------------------------------------
  // 7. Sovereign Success Response
  // ---------------------------------------------------------
  return new Response(
    JSON.stringify({
      ok: true,
      payload,
      sovereign,
      ai,
      integrity: computeIntegrityHash(payload)
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
}

// ---------------------------------------------------------
// V12 Alpha — Unified Error Model
// ---------------------------------------------------------
function sovereignError(code, message, sovereign, status = 400) {
  const body = {
    ok: false,
    error: { code, message },
    sovereign,
    integrity: computeIntegrityHash({ code, message })
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
