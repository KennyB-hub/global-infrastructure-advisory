// src/routes/api/system/cyber/analyze.js
import { DBService } from "../../../system/db/db-service.js";
import { requireRole } from "../../../system/security/require-role.js";
import { routeAI } from "../../../system/ai-router.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  const db = new DBService(env);

  const trust = requireRole("system", request, env);
  if (!trust.allowed) return trust.response;

  const body = await request.json().catch(() => ({}));
  const since = Number(body.since || Date.now() - 5 * 60 * 1000); // last 5 minutes

  const res = await db.query("system",
    "SELECT * FROM security_events WHERE ts > ? ORDER BY ts DESC LIMIT 200",
    [since]
  );

  if (!res.ok) {
    return new Response(JSON.stringify({ ok: false, error: res.error }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const aiResult = await routeAI({
    type: "cyber",
    mode: "realtime-analysis",
    scope: "global",
    events: res.rows
  }, env);

  return new Response(JSON.stringify({ ok: true, analysis: aiResult.result }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
