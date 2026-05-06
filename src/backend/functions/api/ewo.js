// 2050 V12 Alpha — EWO Dispatch Handler
// Global Infrastructure Platform — Emergency Work Order Engine

import { routeEwo } from "../../system/routing/ewo-router.js";
import { requireRole } from "../../system/trust/api-trust.js";
import { buildSovereignMetadata } from "../../system/metadata.js";
import { computeIntegrityHash } from "../../system/integrity.js";
import { applyPolicy } from "../../system/policy-engine.js";
import { buildAIContext } from "../../system/ai-context.js";

export async function handleEwoDispatch(request, env) {
  const path = "/api/ewo/dispatch";

  // ---------------------------------------------------------
  // 1. Sovereign Metadata
  // ---------------------------------------------------------
  const sovereign = buildSovereignMetadata({
    api: "ewo-dispatch",
    version: "2050.V12A",
    node: env?.NODE_ID,
    cluster: env?.CLUSTER_ID,
    path,
    method: "POST"
  });

  // ---------------------------------------------------------
  // 2. Trust‑Zone Enforcement (system-level)
  // ---------------------------------------------------------
  const trust = requireRole("system", request, env);
  if (!trust.allowed) {
    return trust.response;
  }

  // ---------------------------------------------------------
  // 3. Policy Engine Enforcement
  // ---------------------------------------------------------
  const policy = applyPolicy({
    request,
    path,
    zone: "system"
  });

  if (!policy.allowed) {
    return sovereignError("POLICY_BLOCKED", policy.reason, sovereign);
  }

  // ---------------------------------------------------------
  // 4. Parse JSON Body Safely
  // ---------------------------------------------------------
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return sovereignError("INVALID_JSON", "Malformed JSON body", sovereign);
  }

  // ---------------------------------------------------------
  // 5. AI Context (for routing, telemetry, inspector)
  // ---------------------------------------------------------
  const ai = buildAIContext({
    request,
    path,
    workflow: "ewo-dispatch",
    trustZone: "system"
  });

  // ---------------------------------------------------------
  // 6. Execute EWO Routing
  // ---------------------------------------------------------
  let route;
  try {
    route = routeEwo(body);
  } catch (err) {
    return sovereignError("ROUTING_FAILURE", err.message, sovereign);
  }

  // ---------------------------------------------------------
  // 7. Build Payload
  // ---------------------------------------------------------
  const payload = {
    routed: route.routed || false,
    sector: route.sector || null,
    worker: route.worker || null,
    node: route.node || null,
    cluster: route.cluster || null,
    timestamp: Date.now()
  };

  // ---------------------------------------------------------
  // 8. Sovereign Success Response
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
      status: route.routed ? 200 : 400,
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
