// 2050 V12 Alpha — Active Opportunity Engine
// Global Infrastructure Platform — Workforce Opportunity Layer

import { buildSovereignMetadata } from "../../system/metadata.js";
import { computeIntegrityHash } from "../../system/integrity.js";
import { applyPolicy } from "../../system/policy-engine.js";
import { buildAIContext } from "../../system/ai-context.js";
import { requireRole } from "../../system/trust/api-trust.js";

export async function onRequestGet(context) {
  const request = context.request;
  const env = context.env;
  const path = "/api/opportunities/active";

  // ---------------------------------------------------------
  // 1. Sovereign Metadata
  // ---------------------------------------------------------
  const sovereign = buildSovereignMetadata({
    api: "opportunities-active",
    version: "2050.V12A",
    node: env?.NODE_ID,
    cluster: env?.CLUSTER_ID,
    path,
    method: "GET"
  });

  // ---------------------------------------------------------
  // 2. Trust‑Zone Enforcement (public read allowed)
  // ---------------------------------------------------------
  const trust = requireRole("public", request, env);
  if (!trust.allowed) {
    return trust.response;
  }

  // ---------------------------------------------------------
  // 3. Policy Engine Enforcement
  // ---------------------------------------------------------
  const policy = applyPolicy({
    request,
    path,
    zone: "public"
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
    workflow: "opportunity-active",
    trustZone: "public"
  });

  // ---------------------------------------------------------
  // 5. Fetch Active Opportunity (Safe DB Execution)
  // ---------------------------------------------------------
  let active = null;

  try {
    // 5A. Most recent unfilled
    const { results } = await env.DB
      .prepare(`
        SELECT * FROM opportunities
        WHERE filled = 0
        ORDER BY updated_at DESC
        LIMIT 1
      `)
      .all();

    active = results[0] || null;

    // 5B. Fallback: any opportunity
    if (!active) {
      const { results: fallback } = await env.DB
        .prepare(`
          SELECT * FROM opportunities
          ORDER BY updated_at DESC
          LIMIT 1
        `)
        .all();
      active = fallback[0] || null;
    }
  } catch (err) {
    return sovereignError("DB_ERROR", err.message, sovereign);
  }

  // ---------------------------------------------------------
  // 6. Build Payload
  // ---------------------------------------------------------
  const payload = {
    active,
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

