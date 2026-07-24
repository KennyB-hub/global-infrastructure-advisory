// /workers/gov/index.ts
// GIA Sovereign Gov Worker – V12 Sovereign Edition (TypeScript)

import { basicSecurityGuard } from "../../../system/security/worker-guard.js";
import { PolicyEngine } from "../../../system/policy-engine.js";
import { CryptoV12 } from "../../../ai-engines/utils/crypto.js";

import { buildEvent } from "../../../sector/event-builder.js";
import { cyberHook } from "../../../sector/worker-hook.js";

import { verifyDidVcIdentity } from "../../../backend/identity/did-vc-verifier.js";
import { enforceMCP } from "../../../mcp/mcp-enforcer.js";

const policy = new PolicyEngine();

// ---------------------------------------------------------
// Unified JSON Response
// ---------------------------------------------------------
function json(data: Record<string, any>, status: number = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "GIA-Trust-Zone": "gov",
      "GIA-Version": "v12-sovereign"
    }
  });
}

// ---------------------------------------------------------
// MAIN GOV WORKER
// ---------------------------------------------------------
export async function onRequest(context: {
  request: Request;
  env: any;
  waitUntil: (p: Promise<any>) => void;
}): Promise<Response> {
  const request = context.request;
  const env = context.env;
  const url = new URL(request.url);
  const systemTraceId = CryptoV12.randomId();

  //
  // 1. Worker Guard
  //
  const guard = basicSecurityGuard(request, env);
  if (guard) return guard;

  //
  // 2. DID / VC Identity Verification
  //
  const identity = await verifyDidVcIdentity(request, env);
  const trustZone = identity.trustZone || "public";

  //
  // 3. Cyber Threat Scoring
  //
  const event = buildEvent({
    source: "gov-worker",
    sector: "gov",
    trustZone,
    type: "access_attempt",
    metadata: {
      path: url.pathname,
      method: request.method,
      ip: request.headers.get("cf-connecting-ip")
    }
  });

  const cyberResult = await cyberHook(event);

  if (cyberResult.threat.level === "high" || cyberResult.threat.level === "critical") {
    return json(
      {
        ok: false,
        type: "zero-trust-block",
        threat: cyberResult.threat,
        systemTraceId,
        timestamp: new Date().toISOString()
      },
      403
    );
  }

  //
  // 4. MCP Enforcement
  //
  const mcp = await enforceMCP({
    trustZone,
    method: request.method,
    threat: cyberResult.threat,
    sourceCloud: env.CLOUD_PROVIDER,
    targetCloud: env.TARGET_CLOUD || env.CLOUD_PROVIDER
  });

  if (!mcp.allowed) {
    return json(
      {
        ok: false,
        type: "mcp-deny",
        reason: mcp.reason,
        policy: mcp.policy,
        systemTraceId,
        timestamp: new Date().toISOString()
      },
      403
    );
  }

  //
  // 5. Integrity Verification (Decision Engine → Gov Worker)
  //
  let integrityToken: string | null = null;
  let decisionPayload: any = null;

  if (request.method === "POST") {
    try {
      const body = await request.json();
      integrityToken = body.integrityToken;
      decisionPayload = { ...body };
      delete decisionPayload.integrityToken;

      const secret = env.DECISION_ENGINE_SECRET || "DECISION_ENGINE_DEFAULT_SECRET";

      const valid = await CryptoV12.verifyIntegrity(decisionPayload, secret, integrityToken);

      if (!valid) {
        return json(
          {
            ok: false,
            type: "integrity-failed",
            reason: "Integrity token mismatch",
            systemTraceId
          },
          403
        );
      }
    } catch {
      // No JSON body → skip integrity check
    }
  }

  //
  // 6. Policy Check
  //
  const decision = await policy.check({
    trustZone,
    workflow: "gov-access",
    action: "view"
  });

  if (!decision.allowed) {
    const denyPayload = {
      ok: false,
      type: "policy-deny",
      reason: decision.reason,
      trustZone,
      workflow: "gov-access",
      systemTraceId,
      timestamp: new Date().toISOString()
    };

    return json(
      {
        ...denyPayload,
        integrity: {
          hash: await CryptoV12.sha256(JSON.stringify(denyPayload)),
          verified: true
        }
      },
      403
    );
  }

  //
  // 7. Gov Status Endpoint
  //
  if (url.pathname.endsWith("/gov/status")) {
    const payload = {
      ok: true,
      zone: "gov",
      endpoint: "status",
      status: "ok",
      systemTraceId,
      integrityToken,
      timestamp: new Date().toISOString(),
      meta: {
        trustZone,
        workflow: "gov-access",
        version: "v12-sovereign"
      }
    };

    payload.integrity = {
      hash: await CryptoV12.sha256(JSON.stringify(payload)),
      verified: true
    };

    return json(payload);
  }

  //
  // 8. Fallback
  //
  const fallback = {
    ok: false,
    zone: "gov",
    status: "not-found",
    path: url.pathname,
    systemTraceId,
    integrityToken,
    timestamp: new Date().toISOString(),
    meta: {
      trustZone,
      workflow: "gov-access",
      version: "v12-sovereign"
    }
  };

  fallback.integrity = {
    hash: await CryptoV12.sha256(JSON.stringify(fallback)),
    verified: true
  };

  return json(fallback, 404);
}
