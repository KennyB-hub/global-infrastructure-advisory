// GIA API Trust Middleware
// Enforces role-based access for API endpoints

import { checkTrust } from "./trust-middleware.js";

export function requireRole(zone, request) {
  const ok = checkTrust(zone, request);

  if (!ok) {
    return {
      allowed: false,
      response: new Response(JSON.stringify({
        error: "forbidden",
        zone,
        path: new URL(request.url).pathname
      }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      })
    };
  }

  return { allowed: true };
}
