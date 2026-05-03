// /workers/routing.js
import { secure } from "../security/middleware.js";
import { protectedRoutes } from "./protected-routes.js";
import { adminEndpoints } from "./admin-endpoints.js";
import { Cortex } from "../ai/cortex.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/heartbeat") {
      return new Response("OK", { status: 200 });
    }

    // AI Cortex
    if (url.pathname === "/ai/process" && request.method === "POST") {
      const cortex = new Cortex(env);
      const input = await request.json();
      const result = await cortex.process(input);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Admin routes
    if (url.pathname.startsWith("/admin")) {
      return adminEndpoints(request, env, ctx);
    }

    // Protected routes
    if (url.pathname.startsWith("/api")) {
      return secure(protectedRoutes)(request, env, ctx);
    }

    return new Response("Not Found", { status: 404 });
  }
};
