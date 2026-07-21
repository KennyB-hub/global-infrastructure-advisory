// GIA API Trust Middleware
// Enforces role-based access for API endpoints

// 2050 V12 Alpha — Sovereign Trust‑Zone Guard
// Replaces requireRole()

import { checkTrust } from "../../system/trust-middleware.js";
import { applyPolicy } from "../../system/policy-engine.js";
import { buildSovereignMetadata } from "../../system/metadata.js";
import { computeIntegrityHash } from "../../system/integrity.js";
import { buildAIContext } from "../../system/ai-context.js";

export function requireRole(zone, request, env) {
  const path = new URL(request.url).pathname;

  // ---------------------------------------------------------
  // 1. Sovereign Metadata (V12 Alpha requirement)
  // ---------------------------------------------------------
  const sovereign = buildSovereignMetadata({
    api: "trust-guard",
    version: "2050.V12A",
    node: env?.NODE_ID,
    cluster: env?.CLUSTER_ID,
    zone,
    path,
    method: request.method
  });

  // ---------------------------------------------------------
  // 2. Trust‑Zone Enforcement
  // ---------------------------------------------------------
  const trust = checkTrust(zone, request);

  if (!trust) {
    return {
      allowed: false,
      response: sovereignError("TRUST_DENIED", "Access denied by trust‑zone policy", sovereign)
    };
  }

  // ---------------------------------------------------------
  // 3. Policy Engine Enforcement
  // ---------------------------------------------------------
  const policy = applyPolicy({ request, path, zone });
  if (!policy.allowed) {
    return {
      allowed: false,
      response: sovereignError("POLICY_BLOCKED", policy.reason, sovereign)
    };
  }

  // ---------------------------------------------------------
  // 4. AI Context (for routing, logging, inspector)
  // ---------------------------------------------------------
  const ai = buildAIContext({
    request,
    path,
    trustZone: zone,
    workflow: "trust-guard"
  });

  // ---------------------------------------------------------
  // 5. Allowed
  // ---------------------------------------------------------
  return {
    allowed: true,
    sovereign,
    ai
  };
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
    status: 403,
    headers: { "Content-Type": "application/json" }
  });
}
