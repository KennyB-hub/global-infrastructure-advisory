// 2050 V12 Alpha — AI Policy Engine with Cyber Logging

import { DBService } from "../db/db-service.js";

export async function enforceAIPolicy({ trustZone, workflow, request, env }) {
  const blocked = [
    // --- Public cannot access sensitive workflows ---
    { trustZone: "public", workflow: "gov-sectors" },
    { trustZone: "public", workflow: "system-heartbeat" },
    { trustZone: "public", workflow: "gov-intel" },

    // --- Public cannot use AIM at all ---
    { trustZone: "public", workflow: "aim-farmer" },
    { trustZone: "public", workflow: "aim-contractor" },
    { trustZone: "public", workflow: "aim-gov" },
    { trustZone: "public", workflow: "aim-apps" },

    // --- Farmer cannot access contractor or gov AIM ---
    { trustZone: "farmer", workflow: "aim-contractor" },
    { trustZone: "farmer", workflow: "aim-gov" },

    // --- Contractor cannot access farmer or gov AIM ---
    { trustZone: "contractor", workflow: "aim-farmer" },
    { trustZone: "contractor", workflow: "aim-gov" },

    // --- Gov can access all AIM modes (optional) ---
    // No blocks for gov
  ];

  const hit = blocked.find(
    r => r.trustZone === trustZone && r.workflow === workflow
  );

  // If allowed, return early
  if (!hit) return { allowed: true };

  // If blocked, log to Cyber DB
  const db = new DBService(env);

  await db.query("system",
    `INSERT INTO security_events 
      (ts, zone, workflow, event_type, ip, ua, severity, meta)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      Date.now(),
      trustZone,
      workflow,
      "AI_POLICY_BLOCKED",
      request.headers.get("CF-Connecting-IP") || null,
      request.headers.get("User-Agent") || null,
      "medium",
      JSON.stringify({ reason: "AI_POLICY_BLOCKED" })
    ]
  );

  return { allowed: false, reason: "AI_POLICY_BLOCKED" };
}
