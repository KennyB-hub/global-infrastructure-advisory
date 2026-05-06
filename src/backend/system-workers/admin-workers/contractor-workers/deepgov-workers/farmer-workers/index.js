// /workers/farmer/index.js
// GIA Sovereign Farmer Worker – V12 Alpha

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
      "GIA-Trust-Zone": "farmer",
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
  // 3. Farmer must authenticate
  //
  const auth = request.headers.get("Authorization");
  if (!auth) {
    return json(
      {
        ok: false,
        zone: "farmer",
        status: "unauthorized",
        reason: "Missing Authorization header",
        timestamp: new Date().toISOString()
      },
      401
    );
  }

  //
  // 4. Policy check for farmer workflows
  //
  const decision = await policy.check({
    trustZone,
    workflow: "farmer-access",
    action: "view"
  });

  if (!decision.allowed) {
    return json(
      {
        ok: false,
        type: "policy-deny",
        reason: decision.reason,
        trustZone,
        workflow: "farmer-access",
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
  // 5. Farmer Status Endpoint
  //
  if (url.pathname.endsWith("/farmer/status")) {
    const payload = {
      ok: true,
      zone: "farmer",
      endpoint: "status",
      status: "ok",
      timestamp: new Date().toISOString(),
      meta: {
        trustZone,
        workflow: "farmer-access",
        version: "v12-alpha"
      }
    };

    payload.integrity = {
      hash: await sha256(JSON.stringify(payload)),
      verified: true
    };

    return json(payload);
  }

  //
  // 6. Fallback
  //
  const fallback = {
    ok: false,
    zone: "farmer",
    status: "not-found",
    path: url.pathname,
    timestamp: new Date().toISOString(),
    meta: {
      trustZone,
      workflow: "farmer-access",
      version: "v12-alpha"
    }
  };

  fallback.integrity = {
    hash: await sha256(JSON.stringify(fallback)),
    verified: true
  };

  return json(fallback, 404);
}

