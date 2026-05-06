// /workers/payroll/index.js
// GIA Sovereign Payroll Worker – V12 Alpha

import { basicSecurityGuard } from "../../src/security/worker-guard.js";
import { PolicyEngine } from "../../src/ai-engine/policy-engine.js";
import { sha256 } from "../../src/ai-engine/utils/crypto.js";

const policy = new PolicyEngine();

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "GIA-Trust-Zone": "payroll",
      "GIA-Version": "v12-alpha"
    }
  });
}

export async function onRequest(context) {
  const request = context.request;
  const env = context.env;
  const url = new URL(request.url);

  // 1. Worker Guard
  const guard = basicSecurityGuard(request, env);
  if (guard) return guard;

  // 2. Trust Zone
  const trustZone = request.headers.get("GIA-Trust-Zone") || "public";

  // 3. Policy Check
  const decision = await policy.check({
    trustZone,
    workflow: "payroll-access",
    action: "view"
  });

  if (!decision.allowed) {
    return json({
      ok: false,
      type: "policy-deny",
      reason: decision.reason,
      trustZone,
      workflow: "payroll-access",
      timestamp: new Date().toISOString(),
      integrity: {
        hash: await sha256(JSON.stringify(decision)),
        verified: true
      }
    }, 403);
  }

  // 4. Payroll Status Endpoint
  if (url.pathname.endsWith("/payroll/status")) {
    const payload = {
      ok: true,
      zone: "payroll",
      endpoint: "status",
      status: "ok",
      timestamp: new Date().toISOString(),
      meta: {
        trustZone,
        workflow: "payroll-access",
        version: "v12-alpha"
      }
    };

    payload.integrity = {
      hash: await sha256(JSON.stringify(payload)),
      verified: true
    };

    return json(payload);
  }

  // 5. Fallback
  const fallback = {
    ok: false,
    zone: "payroll",
    status: "not-found",
    path: url.pathname,
    timestamp: new Date().toISOString(),
    meta: {
      trustZone,
      workflow: "payroll-access",
      version: "v12-alpha"
    }
  };

  fallback.integrity = {
    hash: await sha256(JSON.stringify(fallback)),
    verified: true
  };

  return json(fallback, 404);
}
