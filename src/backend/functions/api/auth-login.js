// 2050 V12 Alpha — Auth Login Handler
// Global Infrastructure Platform — Authentication Layer

import { buildSovereignMetadata } from "../system/metadata.js";
import { computeIntegrityHash } from "../system/integrity.js";
import { applyPolicy } from "../system/policy-engine.js";
import { buildAIContext } from "../system/ai-context.js";

export async function handleAuthLogin(request, env) {
  const url = new URL(request.url);
  const role = url.searchParams.get("role") || "public";
  const path = url.pathname;

  // ---------------------------------------------------------
  // 1. Sovereign Metadata (required for all V12 Alpha APIs)
  // ---------------------------------------------------------
  const sovereign = buildSovereignMetadata({
    api: "auth-login",
    version: "2050.V12A",
    node: env?.NODE_ID,
    cluster: env?.CLUSTER_ID,
    path,
    method: request.method
  });

  // ---------------------------------------------------------
  // 2. Policy Engine Enforcement
  // ---------------------------------------------------------
  const policy = applyPolicy({ request, path, zone: "public" });
  if (!policy.allowed) {
    return sovereignError("POLICY_BLOCKED", policy.reason, sovereign);
  }

  // ---------------------------------------------------------
  // 3. AI Context (for routing, telemetry, inspector)
  // ---------------------------------------------------------
  const ai = buildAIContext({
    request,
    path,
    workflow: "auth-login",
    trustZone: "public"
  });

  // ---------------------------------------------------------
  // 4. Build Redirect Target
  // ---------------------------------------------------------
  const redirectUrl = `/auth/callback.html?role=${encodeURIComponent(role)}`;

  const payload = {
    redirect: redirectUrl,
    role,
    timestamp: Date.now()
  };

  // ---------------------------------------------------------
  // 5. Sovereign Redirect Response (V12 Alpha)
  // ---------------------------------------------------------
  return new Response(null, {
    status: 302,
    headers: {
      "Location": redirectUrl,
      "X-Sovereign-Metadata": JSON.stringify(sovereign),
      "X-AI-Context": JSON.stringify(ai),
      "X-Integrity": computeIntegrityHash(payload)
    }
  });
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
