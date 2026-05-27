// /workers/farmer/index.ts
// GIA Sovereign Farmer Worker – V12 Alpha (TypeScript)

import { basicSecurityGuard } from "../../src/security/worker-guard";
import { PolicyEngine } from "../../src/ai-engine/policy-engine";
import { sha256 } from "../../src/ai-engine/utils/crypto";

import { buildEvent } from "../../src/system/cyber/event-builder";
import { cyberHook } from "../../src/system/cyber/worker-hook";

const policy = new PolicyEngine();

// ---------------------------------------------------------
// Unified JSON Response
// ---------------------------------------------------------
function json(
  data: Record<string, any>,
  status: number = 200
): Response {
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

// ---------------------------------------------------------
// MAIN FARMER WORKER
// ---------------------------------------------------------
export async function onRequest(
  context: { request: Request; env: any; waitUntil: (p: Promise<any>) => void }
): Promise<Response> {
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
  // 3. Cyber Engine Hook (Farmer Worker)
  //
  const event = buildEvent({
    source: "farmer-worker",
    sector: "farmer",
    trustZone,
    type: "access_attempt",
    metadata: {
      path: url.pathname,
      method: request.method,
      ip: request.headers.get("cf-connecting-ip")
    }
  });

  await cyberHook(event);

  //
  // 4. Farmer must authenticate
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
  // 5. Policy check for farmer workflows
  //
  const decision = await policy.check({
    trustZone,
    workflow: "farmer-access",
    action: "view"
  });

  if (!decision.allowed) {
    const denyPayload = {
      ok: false,
      type: "policy-deny",
      reason: decision.reason,
      trustZone,
      workflow: "farmer-access",
      timestamp: new Date().toISOString()
    };

    return json(
      {
        ...denyPayload,
        integrity: {
          hash: await sha256(JSON.stringify(denyPayload)),
          verified: true
        }
      },
      403
    );
  }

  //
  // 6. Farmer Status Endpoint
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

    payload["integrity"] = {
      hash: await sha256(JSON.stringify(payload)),
      verified: true
    };

    return json(payload);
  }

  //
  // 7. Fallback
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

  fallback["integrity"] = {
    hash: await sha256(JSON.stringify(fallback)),
    verified: true
  };

  return json(fallback, 404);
}
