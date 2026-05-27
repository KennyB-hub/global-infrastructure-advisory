// /workers/employee/index.ts
// GIA Sovereign Employee Worker – V12 Alpha (TypeScript)

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
      "GIA-Trust-Zone": "employee",
      "GIA-Version": "v12-alpha"
    }
  });
}

// ---------------------------------------------------------
// MAIN EMPLOYEE WORKER
// ---------------------------------------------------------
export async function onRequest(
  context: { request: Request; env: any; waitUntil: (p: Promise<any>) => void }
): Promise<Response> {
  const request = context.request;
  const env = context.env;
  const url = new URL(request.url);

  // ---------------------------------------------------------
  // 1. Worker Guard
  // ---------------------------------------------------------
  const guard = basicSecurityGuard(request, env);
  if (guard) return guard;

  // ---------------------------------------------------------
  // 2. Extract trust zone
  // ---------------------------------------------------------
  const trustZone = request.headers.get("GIA-Trust-Zone") || "public";

  // ---------------------------------------------------------
  // 3. Cyber Engine Hook (Employee Worker)
  // ---------------------------------------------------------
  const event = buildEvent({
    source: "employee-worker",
    sector: "employee",
    trustZone,
    type: "access_attempt",
    metadata: {
      path: url.pathname,
      method: request.method,
      ip: request.headers.get("cf-connecting-ip")
    }
  });

  await cyberHook(event);

  // ---------------------------------------------------------
  // 4. Policy Check
  // ---------------------------------------------------------
  const decision = await policy.check({
    trustZone,
    workflow: "employee-access",
    action: "view"
  });

  if (!decision.allowed) {
    const denyPayload = {
      ok: false,
      type: "policy-deny",
      reason: decision.reason,
      trustZone,
      workflow: "employee-access",
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

  // ---------------------------------------------------------
  // 5. Employee Status Endpoint
  // ---------------------------------------------------------
  if (url.pathname.endsWith("/employee/status")) {
    const payload = {
      ok: true,
      zone: "employee",
      endpoint: "status",
      status: "ok",
      timestamp: new Date().toISOString(), // FIXED: your original had `new Date.toISOString()` (bug)
      meta: {
        trustZone,
        workflow: "employee-access",
        version: "v12-alpha"
      }
    };

    payload["integrity"] = {
      hash: await sha256(JSON.stringify(payload)),
      verified: true
    };

    return json(payload);
  }

  // ---------------------------------------------------------
  // 6. Fallback
  // ---------------------------------------------------------
  const fallback = {
    ok: false,
    zone: "employee",
    status: "not-found",
    path: url.pathname,
    timestamp: new Date().toISOString(),
    meta: {
      trustZone,
      workflow: "employee-access",
      version: "v12-alpha"
    }
  };

  fallback["integrity"] = {
    hash: await sha256(JSON.stringify(fallback)),
    verified: true
  };

  return json(fallback, 404);
}
