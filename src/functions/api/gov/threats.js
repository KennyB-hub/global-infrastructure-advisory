// GovHub – Threat Dashboard API (V12 Alpha)

import { DBService } from "../../../system/db/db-service.js";
import { requireRole } from "../../../system/security/require-role.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const db = new DBService(env);

  // Gov only (optionally allow system)
  const trust = requireRole("gov", request, env, { allowSystem: true });
  if (!trust.allowed) return trust.response;

  const url = new URL(request.url);
  const timeframe = Number(url.searchParams.get("hours") || 24);
  const since = Date.now() - timeframe * 3600 * 1000;

  // 1) Recent events (gov + system)
  const eventsRes = await db.query(
    "system",
    `SELECT id, ts, zone, workflow, event_type, ip, ua, severity, meta
     FROM security_events
     WHERE ts >= ?
       AND zone IN ('gov','system')
     ORDER BY ts DESC
     LIMIT 200`,
    [since]
  );

  const events = eventsRes.rows || [];

  // 2) Severity counts
  const sevRes = await db.query(
    "system",
    `SELECT severity, COUNT(*) AS count
     FROM security_events
     WHERE ts >= ?
       AND zone IN ('gov','system')
     GROUP BY severity`,
    [since]
  );

  // 3) Hot zones / workflows
  const zoneRes = await db.query(
    "system",
    `SELECT zone, workflow, COUNT(*) AS count
     FROM security_events
     WHERE ts >= ?
       AND zone IN ('gov','system')
     GROUP BY zone, workflow
     ORDER BY count DESC
     LIMIT 20`,
    [since]
  );

  // 4) Top IPs
  const ipRes = await db.query(
    "system",
    `SELECT ip, COUNT(*) AS count
     FROM security_events
     WHERE ts >= ?
       AND zone IN ('gov','system')
       AND ip IS NOT NULL
     GROUP BY ip
     ORDER BY count DESC
     LIMIT 20`,
    [since]
  );

  return new Response(JSON.stringify({
    ok: true,
    timeframeHours: timeframe,
    events,
    severity: sevRes.rows || [],
    hotZones: zoneRes.rows || [],
    topIPs: ipRes.rows || []
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
