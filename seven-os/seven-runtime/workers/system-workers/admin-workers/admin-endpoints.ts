// /workers/admin/access.ts
// GIA Sovereign Admin Access Endpoint – V12 Sovereign Edition (TypeScript)

import { basicSecurityGuard } from "../../seven-os/security/worker-guard";
import { PolicyEngine } from "../../seven-os/ai-engine/policy-engine";
import { CryptoV12 } from "../../seven-os/ai-engine/utils/crypto.js";

import { buildEvent } from "../../seven-os/system/cyber/event-builder";
import { cyberHook } from "../../seven-os/system/cyber/worker-hook";

import { verifyDidVcIdentity } from "../../runtime/system/identity/did-vc-verifier";
import { enforceMCP } from "../../runtime/system/mcp/mcp-enforcer";

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
      "GIA-Trust-Zone": "admin",
      "GIA-Version": "v12-sovereign"
    }
  });
}

// ---------------------------------------------------------
// MAIN WORKER
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
    source: "admin-access-worker",
    sector: "admin",
    trustZone,
    type: "access_attempt",
    metadata: {
      method: request.method,
      path: url.pathname,
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
  // 5. Integrity Verification (Decision Engine → Admin Access Worker)
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
      // No JSON → skip integrity check
    }
  }

  //
  // 6. Policy Check
  //
  const decision = await policy.check({
    trustZone,
    workflow: "admin-access",
    action: "view"
  });

  if (!decision.allowed) {
    const denyPayload = {
      ok: false,
      type: "policy-deny",
      reason: decision.reason,
      trustZone,
      workflow: "admin-access",
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
  // 7. Success Response
  //
  const payload = {
    ok: true,
    zone: "admin",
    access: "admin-only",
    status: "ok",
    systemTraceId,
    integrityToken,
    timestamp: new Date().toISOString(),
    meta: {
      trustZone,
      workflow: "admin-access",
      version: "v12-sovereign"
    }
  };

  payload["integrity"] = {
    hash: await CryptoV12.sha256(JSON.stringify(payload)),
    verified: true
  };

  return json(payload);
}
