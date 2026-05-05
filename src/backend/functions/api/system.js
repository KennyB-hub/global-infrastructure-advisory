// src/backend/functions/api/system.js
import { requireRole } from "../../system/trust/api-trust.js";

export async function handleSystemHealth(request) {
  const trust = requireRole("admin", request);
  if (!trust.allowed) return trust.response;

  return new Response(JSON.stringify({
    status: "ok",
    services: {
      api: "ok",
      routing: "ok",
      sectors: "ok"
    },
    timestamp: Date.now()
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

export async function handleSystemUptime(request) {
  const trust = requireRole("system", request);
  if (!trust.allowed) return trust.response;

  // TODO: wire to real uptime module
  return new Response(JSON.stringify({
    uptime_ms: Date.now(), // placeholder
    timestamp: Date.now()
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
