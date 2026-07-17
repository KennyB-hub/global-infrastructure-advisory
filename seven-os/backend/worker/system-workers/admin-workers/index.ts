// /workers/admin/index.ts
// GIA Sovereign Admin Worker – V12 Sovereign Edition

import { basicSecurityGuard } from "../../seven-os/security/worker-guard";
import { PolicyEngine } from "../../seven-os/engines/ai/policy-engine";
import { TokenService } from "../../seven-os/security/token-service";
import { HashUtils } from "../../seven-os/security/hash-utils";
import { CryptoV12 } from "../../seven-os/engine/ai/crypto.js";

import { buildEvent } from "../../seven-os/system/cyber/event-builder";
import { cyberHook } from "../../seven-os/system/cyber/worker-hook";

import { verifyDidVcIdentity } from "../../backend/system/identity/did-vc-verifier";
import { enforceMCP } from "../../mcp/mcp-enforcer";

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
// MAIN ADMIN WORKER
// ---------------------------------------------------------
export async function adminEndpoints(
  request: Request,
  env: any,
  ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  const systemTraceId = CryptoV12.randomId();

  //
  // 1. Worker Guard (V12 Sovereign)
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
    source: "admin-worker",
    sector: "admin",
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
        trust: cyberResult.trust,
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
  // 5. Integrity Verification (Decision Engine → Admin Worker)
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
  // 6. Admin Login
  //
  if (url.pathname === "/admin/login" && request.method === "POST") {
    try {
      const { email, password } = decisionPayload || await request.json();

      const stored = await env.ADMINS.get(email);
      if (!stored) {
        return json({ ok: false, error: "Invalid credentials", systemTraceId }, 401);
      }

      const admin = JSON.parse(stored);
      const hash = new HashUtils();

      const valid = await hash.compare(password, admin.password);
      if (!valid) {
        return json({ ok: false, error: "Invalid credentials", systemTraceId }, 401);
      }

      const tokenService = new TokenService(env);
      const token = await tokenService.issue({
        id: admin.id,
        role: "admin",
        trustZone: "admin",
        clearance: "A1"
      });

      return json({
        ok: true,
        type: "admin-login",
        token,
        systemTraceId,
        integrityToken,
        meta: {
          trustZone: "admin",
          workflow: "auth",
          version: "v12-sovereign"
        }
      });
    } catch (err: any) {
      return json({ ok: false, error: err.message, systemTraceId }, 500);
    }
  }

  //
  // 7. Admin Dashboard (Protected)
  //
  if (url.pathname === "/admin/dashboard") {
    const decision = await policy.check({
      trustZone: "admin",
      workflow: "admin-dashboard",
      action: "view"
    });

    if (!decision.allowed) {
      return json(
        {
          ok: false,
          error: decision.reason,
          systemTraceId
        },
        403
      );
    }

    return json({
      ok: true,
      type: "admin-dashboard",
      message: "Admin Dashboard OK",
      systemTraceId,
      integrityToken,
      meta: {
        trustZone: "admin",
        workflow: "admin-dashboard",
        version: "v12-sovereign"
      }
    });
  }

  //
  // 8. Fallback
  //
  return json(
    {
      ok: false,
      error: "Admin route not found",
      systemTraceId,
      integrityToken
    },
    404
  );
}
