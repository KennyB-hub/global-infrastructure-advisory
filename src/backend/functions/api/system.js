// 2050 V12 Alpha — System Diagnostics
// Global Infrastructure Platform — System Layer

import { requireRole } from "../../system/trust/api-trust.js";
import { buildSovereignMetadata } from "../../system/metadata.js";
import { computeIntegrityHash } from "../../system/integrity.js";
import { applyPolicy } from "../../system/policy-engine.js";
import { buildAIContext } from "../../system/ai-context.js";
import { getUptime } from "../../system/uptime.js"; // your real uptime module

// ---------------------------------------------------------
// SYSTEM HEALTH
// ---------------------------------------------------------
export async function handleSystemHealth(request, env) {
  const path = "/api/system/health";

  // 1. Sovereign Metadata
  const sovereign = buildSovereignMetadata({
    api: "system-health",
    version: "2050.V12A",
    node: env?.NODE_ID,
    cluster: env?.CLUSTER_ID,
    path,
    method: "GET"
  });

  // 2. Trust‑Zone Enforcement (admin-level)
  const trust = requireRole("admin", request, env);
  if (!trust.allowed) return trust.response;

  // 3. Policy Engine
  const policy = applyPolicy({ request, path, zone: "admin" });
  if (!policy.allowed) {
    return sovereignError("POLICY_BLOCKED", policy.reason, sovereign);
  }

  // 4. AI Context
  const ai = buildAIContext({
    request,
    path,
    workflow: "system-health",
    trustZone: "admin"
  });

  // 5. Payload
  const payload = {
    status: "ok",
    services: {
      api: "ok",
      routing: "ok",
      sectors: "ok"
    },
    timestamp: Date.now()
  };

  // 6. Sovereign Success Response
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
// SYSTEM UPTIME
// ---------------------------------------------------------
export async function handleSystemUptime(request, env) {
  const path = "/api/system/uptime";

  // 1. Sovereign Metadata
  const sovereign = buildSovereignMetadata({
    api: "system-uptime",
    version: "2050.V12A",
    node: env?.NODE_ID,
    cluster: env?.CLUSTER_ID,
    path,
    method: "GET"
  });

  // 2. Trust‑Zone Enforcement (system-level)
  const trust = requireRole("system", request, env);
  if (!trust.allowed) return trust.response;

  // 3. Policy Engine
  const policy = applyPolicy({ request, path, zone: "system" });
  if (!policy.allowed) {
    return sovereignError("POLICY_BLOCKED", policy.reason, sovereign);
  }

  // 4. AI Context
  const ai = buildAIContext({
    request,
    path,
    workflow: "system-uptime",
    trustZone: "system"
  });

  // 5. Real Uptime Module
  let uptimeMs;
  try {
    uptimeMs = getUptime(); // your real uptime engine
  } catch (err) {
    return sovereignError("UPTIME_ENGINE_FAILURE", err.message, sovereign);
  }

  const payload = {
    uptime_ms: uptimeMs,
    timestamp: Date.now()
  };

  // 6. Sovereign Success Response
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
