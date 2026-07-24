// 2050 V12 Alpha — Cyber Auto-Blocking Engine
// Works with Cyber Engine + AI-Policy + DB_SYSTEM

import { DBService } from "../../system/db/db-service.js";

export async function cyberAutoBlock({ analysis, request, env }) {
  const db = new DBService(env);

  // If Cyber Engine says no block → exit
  if (!analysis.block_recommended) {
    return { blocked: false, reason: "no-action" };
  }

  // Extract identifiers
  const ip = request.headers.get("CF-Connecting-IP") || null;
  const ua = request.headers.get("User-Agent") || null;

  // Block key (if present)
  const sessionKey = request.headers.get("X-Session-Key") || null;

  // Build block record
  const blockRecord = {
    ts: Date.now(),
    ip,
    ua,
    sessionKey,
    severity: analysis.overall_severity || "unknown",
    summary: analysis.summary || "",
    findings: analysis.findings || []
  };

  // Store block event in DB_SYSTEM
  await db.query("system",
    `INSERT INTO security_events
      (ts, zone, workflow, event_type, ip, ua, severity, meta)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      blockRecord.ts,
      "system",
      "cyber-auto-block",
      "CYBER_AUTO_BLOCK",
      ip,
      ua,
      blockRecord.severity,
      JSON.stringify(blockRecord)
    ]
  );

  // Store block in KV for fast lookup
  if (sessionKey) {
    await db.putKV("cyber-blocks", `key:${sessionKey}`, "blocked", 3600);
  }

  if (ip) {
    await db.putKV("cyber-blocks", `ip:${ip}`, "blocked", 3600);
  }

  return {
    blocked: true,
    reason: "cyber-auto-block",
    ip,
    sessionKey
  };
}
