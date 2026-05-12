// /workers/deepgov/index.js
// GIA Sovereign DeepGov Worker – V12 Alpha

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
      "GIA-Trust-Zone": "deepgov",
      "GIA-Version": "v12-alpha"
    }
  });
}

export async function onRequest(context) {
  const request = context.request;
  const env = context.env;
  const url = new URL(request.url);

  //
  // 1. Worker Guard (V12 Alpha)
  //
  const guard = basicSecurityGuard(request, env);
  if (guard) return guard;

  //
  // 2. Extract trust zone
  //
  const trustZone = request.headers.get("GIA-Trust-Zone") || "public";

  //
  // 3. DeepGov override check
  //
  const decision = await policy.check({
    trustZone,
    workflow: "deepgov-access",
    action: "override"
  });

  if (!decision.allowed) {
    return json(
      {
        ok: false,
        type: "policy-deny",
        reason: decision.reason,
        trustZone,
        workflow: "deepgov-access",
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
  // 4. DeepGov Sovereign Response
  //
  const payload = {
    ok: true,
    zone: "deepgov",
    access: "sovereign-only",
    path: url.pathname,
    status: "override-granted",
    timestamp: new Date().toISOString(),
    meta: {
      trustZone,
      workflow: "deepgov-access",
      override: true,
      version: "v12-alpha"
    }
  };

  payload.integrity = {
    hash: await sha256(JSON.stringify(payload)),
    verified: true
  };

  return json(payload);
}
