// 2050 V12 Alpha — Auth API Handlers
// Global Infrastructure Platform — Authentication Layer

import { buildSovereignMetadata } from "../system/metadata.js";
import { computeIntegrityHash } from "../system/integrity.js";
import { applyPolicy } from "../system/policy-engine.js";
import { buildAIContext } from "../system/ai-context.js";

// ---------------------------------------------------------
// WHO AM I
// ---------------------------------------------------------
export async function handleAuthWhoAmI(request, env) {
  const path = new URL(request.url).pathname;
  const role = request.headers.get("X-Role") || "public";

  // 1. Sovereign Metadata
  const sovereign = buildSovereignMetadata({
    api: "auth-whoami",
    version: "2050.V12A",
    node: env?.NODE_ID,
    cluster: env?.CLUSTER_ID,
    path,
    method: request.method
  });

  // 2. Policy Engine
  const policy = applyPolicy({ request, path, zone: "public" });
  if (!policy.allowed) {
    return sovereignError("POLICY_BLOCKED", policy.reason, sovereign);
  }

  // 3. AI Context
  const ai = buildAIContext({
    request,
    path,
    workflow: "auth-whoami",
    trustZone: "public"
  });

  // 4. Payload
  const payload = {
    role,
    timestamp: Date.now()
  };

  // 5. Sovereign Response
  return sovereignSuccess(payload, sovereign, ai);
}

// ---------------------------------------------------------
// ROLES + CAPABILITIES
// ---------------------------------------------------------
export async function handleAuthRoles(request, env) {
  const path = new URL(request.url).pathname;
  const role = request.headers.get("X-Role") || "public";

  // 1. Sovereign Metadata
  const sovereign = buildSovereignMetadata({
    api: "auth-roles",
    version: "2050.V12A",
    node: env?.NODE_ID,
    cluster: env?.CLUSTER_ID,
    path,
    method: request.method
  });

  // 2. Policy Engine
  const policy = applyPolicy({ request, path, zone: "public" });
  if (!policy.allowed) {
    return sovereignError("POLICY_BLOCKED", policy.reason, sovereign);
  }

  // 3. AI Context
  const ai = buildAIContext({
    request,
    path,
    workflow: "auth-roles",
    trustZone: "public"
  });

  // 4. Capability Mapping (placeholder for now)
  const capabilities = []; // You will fill this with V12 Alpha role → capability mapping

  const payload = {
    role,
    capabilities,
    timestamp: Date.now()
  };

  // 5. Sovereign Response
  return sovereignSuccess(payload, sovereign, ai);
}

// ---------------------------------------------------------
// V12 Alpha — Unified Success Wrapper
// ---------------------------------------------------------
function sovereignSuccess(payload, sovereign, ai) {
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

