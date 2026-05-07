// src/routes/api/system/cyber/events.js
import { DBService } from "../../../system/db/db-service.js";
import { requireRole } from "../../../system/security/require-role.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const db = new DBService(env);

  const trust = requireRole("system", request, env);
  if (!trust.allowed) return trust.response;

  const since = Number(new URL(request.url).searchParams.get("since") || 0);
  const limit = 200;

  const res = await db.query("system",
    "SELECT * FROM security_events WHERE ts > ? ORDER BY ts DESC LIMIT ?",
    [since, limit]
  );

  return new Response(JSON.stringify({ ok: res.ok, events: res.rows || [], error: res.error || null }), {
    status: res.ok ? 200 : 500,
    headers: { "Content-Type": "application/json" }
  });
}
