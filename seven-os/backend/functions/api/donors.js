// 2050 V12 Alpha — Donor Listing Engine
// Global Infrastructure Platform — Donor Data Layer

import { buildSovereignMetadata } from "../../../system/metadata.js";
import { computeIntegrityHash } from "../../../system/integrity.js";
import { applyPolicy } from "../../../system/policy-engine.js";
import { buildAIContext } from "../../../system/ai-context.js";

export async function listDonors(request, env) {
  const path = "/data/donors/list";

  // ---------------------------------------------------------
  // 1. Sovereign Metadata
  // ---------------------------------------------------------
  const sovereign = buildSovereignMetadata({
    api: "donor-list",
    version: "2050.V12A",
    node: env?.NODE_ID,
    cluster: env?.CLUSTER_ID,
    path,
    method: request?.method || "SYSTEM"
  });

  // ---------------------------------------------------------
  // 2. Policy Engine Enforcement
  // Donor data is privileged — admin trust-zone
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
  // 3. AI Context
  // ---------------------------------------------------------
  const ai = buildAIContext({
    request,
    path,
    workflow: "donor-list",
    trustZone: "admin"
  });

  // ---------------------------------------------------------
  // 4. Execute DB Query Safely
  // ---------------------------------------------------------
  let results = [];
  try {
    const stmt = await env.DB.prepare("SELECT * FROM donors");
    const data = await stmt.all();
    results = data.results || [];
  } catch (err) {
    return sovereignError("DB_ERROR", err.message, sovereign);
  }

  // ---------------------------------------------------------
  // 5. Payload
  // ---------------------------------------------------------
  const payload = {
    count: results.length,
    donors: results,
    timestamp: Date.now()
  };

  // ---------------------------------------------------------
  // 6. Sovereign Success Response
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
function sovereignError(code, message, sovereign) {
  const body = {
    ok: false,
    error: { code, message },
    sovereign,
    integrity: computeIntegrityHash({ code, message })
  };

  return new Response(JSON.stringify(body), {
    status: 400,
    headers: { "Content-Type": "application/json" }
  });
}
