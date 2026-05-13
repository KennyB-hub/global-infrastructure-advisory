// /workers/admin/index.js
// GIA Sovereign Admin Worker – V12 Alpha

import { basicSecurityGuard } from "../../src/security/worker-guard.js";
import { PolicyEngine } from "../../src/ai-engine/policy-engine.js";
import { TokenService } from "../../src/security/token-service.js";
import { HashUtils } from "../../src/security/hash-utils.js";

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

export async function adminEndpoints(request, env, ctx) {
  const url = new URL(request.url);

  //
  // 1. Worker Guard (V12 Alpha)
  //
  const guard = basicSecurityGuard(request, env);
  if (guard) return guard;

  //
  // 2. Admin Login
  //
  if (url.pathname === "/admin/login" && request.method === "POST") {
    try {
      const { email, password } = await request.json();

      const stored = await env.ADMINS.get(email);
      if (!stored)
        return json({ ok: false, error: "Invalid credentials" }, 401);

      const admin = JSON.parse(stored);
      const hash = new HashUtils();

      const valid = await hash.compare(password, admin.password);
      if (!valid)
        return json({ ok: false, error: "Invalid credentials" }, 401);

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
    } catch (err) {
      return json({ ok: false, error: err.message }, 500);
    }
  }

  //
  // 3. Admin Dashboard (Protected)
  //
  if (url.pathname === "/admin/dashboard") {
    const decision = await policy.check({
      trustZone: "admin",
      workflow: "admin-dashboard",
      action: "view"
    });

    if (!decision.allowed)
      return json({ ok: false, error: decision.reason }, 403);

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
  // 4. Fallback
  //
  return json({ ok: false, error: "Admin route not found" }, 404);
}
