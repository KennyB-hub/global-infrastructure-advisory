// /workers/admin/access.js
// GIA Sovereign Admin Access Endpoint – V12 Alpha

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
      "GIA-Trust-Zone": "admin",
      "GIA-Version": "v12-alpha"
    }
  });
}

export async function onRequest(context) {
  const request = context.request;

  //
  // 1. Worker Guard (V12 Alpha)
  //
  const guard = basicSecurityGuard(request, context.env);
  if (guard) return guard;

  //
  // 2. Extract trust zone from headers
  //
  const trustZone = request.headers.get("GIA-Trust-Zone") || "public";

  //
  // 3. Policy check for admin-only workflow
  //
  const decision = await policy.check({
    trustZone,
    workflow: "admin-access",
    action: "view"
  });

  if (!decision.allowed) {
    return json(
      {
        ok: false,
        type: "policy-deny",
        reason: decision.reason,
        trustZone,
        workflow: "admin-access",
        timestamp: new Date().toISOString(),
        integrity: {
          hash: await sha256(JSON.stringify(decision)),
          verified: true
        }
      },
      403
    );
  }

  //
  // 4. Success response
  //
  const payload = {
    ok: true,
    zone: "admin",
    access: "admin-only",
    status: "ok",
    timestamp: new Date().toISOString(),
    meta: {
      trustZone,
      workflow: "admin-access",
      version: "v12-alpha"
    }
  };

  payload.integrity = {
    hash: await sha256(JSON.stringify(payload)),
    verified: true
  };

  return json(payload);
}
