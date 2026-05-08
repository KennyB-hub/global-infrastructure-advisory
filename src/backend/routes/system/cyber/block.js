// SystemHub – Cyber Auto‑Block API (V12 Alpha)

import { DBService } from "../../../system/db/db-service.js";
import { requireRole } from "../../../system/security/require-role.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const db = new DBService(env);

  // Only system/admin
  const trust = requireRole("system", request, env);
  if (!trust.allowed) return trust.response;

  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") || 100);

  const res = await db.query(
    "system",
    `SELECT id, ts, zone, workflow, event_type, ip, ua, severity, meta
     FROM security_events
     WHERE event_type IN ('CYBER_AUTO_BLOCK','CYBER_RATE_BLOCK')
     ORDER BY ts DESC
     LIMIT ?`,
    [limit]
  );

  if (!res.ok) {
    return new Response(JSON.stringify({ ok: false, error: res.error }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const events = (res.rows || []).map(e => ({
    id: e.id,
    ts: e.ts,
    zone: e.zone,
    workflow: e.workflow,
    eventType: e.event_type,
    ip: e.ip,
    ua: e.ua,
    severity: e.severity,
    meta: (() => {
      try { return JSON.parse(e.meta || "{}"); } catch { return {}; }
    })()
  }));

  return new Response(JSON.stringify({ ok: true, blocks: events }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
