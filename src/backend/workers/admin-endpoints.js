// /backend/workers/admin-endpoints.js
import { secure } from "../security/middleware.js";
import { requireAdmin } from "../security/require-admin.js";
import { TokenService } from "../security/token-service.js";
import { HashUtils } from "../security/hash-utils.js";

export async function adminEndpoints(request, env, ctx) {
  const url = new URL(request.url);

  // Admin login
  if (url.pathname === "/admin/login" && request.method === "POST") {
    const { email, password } = await request.json();

    const stored = await env.ADMINS.get(email);
    if (!stored) return new Response("Invalid credentials", { status: 401 });

    const admin = JSON.parse(stored);
    const hash = new HashUtils();

    const valid = await hash.compare(password, admin.password);
    if (!valid) return new Response("Invalid credentials", { status: 401 });

    const tokenService = new TokenService(env);
    const token = await tokenService.issue({
      id: admin.id,
      role: "admin",
      clearance: "A1"
    });

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Admin dashboard (protected)
  if (url.pathname === "/admin/dashboard") {
    return secure(async () => {
      return new Response("Admin Dashboard OK", { status: 200 });
    }, { adminOnly: true })(request, env, ctx);
  }

  return new Response("Admin route not found", { status: 404 });
}
