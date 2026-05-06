// /workers/contractor/index.js
// GIA Sovereign Contractor Worker – V12 Alpha

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
      "GIA-Trust-Zone": "contractor",
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
  // 3. Contractor must authenticate
  //
  const auth = request.headers.get("Authorization");
  if (!auth) {
    return json(
      {
        ok: false,
        zone: "contractor",
        status: "unauthorized",
        reason: "Missing Authorization header",
        timestamp: new Date().toISOString()
      },
      401
    );
  }

  //
  // 4. Policy check for contractor workflows
  //
  const decision = await policy.check({
    trustZone,
    workflow: "contractor-access",
    action: "view"
  });

  if (!decision.allowed) {
    return json(
      {
        ok: false,
        type: "policy-deny",
        reason: decision.reason,
        trustZone,
        workflow: "contractor-access",
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
  // 5. Contractor Status Endpoint
  //
  if (url.pathname.endsWith("/contractor/status")) {
    const payload = {
      ok: true,
      zone: "contractor",
      endpoint: "status",
      status: "ok",
      timestamp: new Date().toISOString(),
      meta: {
        trustZone,
        workflow: "contractor-access",
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
    zone: "contractor",
    status: "not-found",
    path: url.pathname,
    timestamp: new Date().toISOString(),
    meta: {
      trustZone,
      workflow: "contractor-access",
      version: "v12-alpha"
    }
  };

  fallback.integrity = {
    hash: await sha256(JSON.stringify(fallback)),
    verified: true
  };

  return json(fallback, 404);
}
