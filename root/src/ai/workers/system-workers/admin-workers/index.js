// /workers/admin/index.ts
// GIA Sovereign Admin Worker – V12 Alpha (TypeScript)

import { basicSecurityGuard } from "../../src/security/worker-guard";
import { PolicyEngine } from "../../src/ai-engine/policy-engine";
import { TokenService } from "../../src/security/token-service";
import { HashUtils } from "../../src/security/hash-utils";

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
      "GIA-Trust-Zone": "admin",
      "GIA-Version": "v12-alpha"
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

  //
  // 1. Worker Guard (V12 Alpha)
  //
  const guard = basicSecurityGuard(request, env);
  if (guard) return guard;

  //
  // 2. Cyber Engine Hook (Admin Worker)
  //
  const event = buildEvent({
    source: "admin-worker",
    sector: "admin",
    trustZone: "admin",
    type: "access_attempt",
    metadata: {
      path: url.pathname,
      method: request.method,
      ip: request.headers.get("cf-connecting-ip")
    }
  });

  await cyberHook(event);

  //
  // 3. Admin Login
  //
  if (url.pathname === "/admin/login" && request.method === "POST") {
    try {
      const { email, password } = await request.json();

      const stored = await env.ADMINS.get(email);
      if (!stored) {
        return json({ ok: false, error: "Invalid credentials" }, 401);
      }

      const admin = JSON.parse(stored);
      const hash = new HashUtils();

      const valid = await hash.compare(password, admin.password);
      if (!valid) {
        return json({ ok: false, error: "Invalid credentials" }, 401);
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
        meta: {
          trustZone: "admin",
          workflow: "auth",
          version: "v12-alpha"
        }
      });
    } catch (err: any) {
      return json({ ok: false, error: err.message }, 500);
    }
  }

  //
  // 4. Admin Dashboard (Protected)
  //
  if (url.pathname === "/admin/dashboard") {
    const decision = await policy.check({
      trustZone: "admin",
      workflow: "admin-dashboard",
      action: "view"
    });

    if (!decision.allowed) {
      return json({ ok: false, error: decision.reason }, 403);
    }

    return json({
      ok: true,
      type: "admin-dashboard",
      message: "Admin Dashboard OK",
      meta: {
        trustZone: "admin",
        workflow: "admin-dashboard",
        version: "v12-alpha"
      }
    });
  }

  //
  // 5. Fallback
  //
  return json({ ok: false, error: "Admin route not found" }, 404);
}
