// 2050 V12 Alpha — AI Policy Engine with Cyber Logging

import { DBService } from "../db/db-service.js";

export async function enforceAIPolicy({ trustZone, workflow, request, env }) {
  const blocked = [
    //
    // PUBLIC RESTRICTIONS
    //
    { trustZone: "public", workflow: "gov-sectors" },
    { trustZone: "public", workflow: "system-heartbeat" },
    { trustZone: "public", workflow: "gov-intel" },

    // Public cannot use ANY AIM mode
    { trustZone: "public", workflow: "aim-farmer" },
    { trustZone: "public", workflow: "aim-contractor" },
    { trustZone: "public", workflow: "aim-gov" },
    { trustZone: "public", workflow: "aim-apps" },
    { trustZone: "public", workflow: "aim-defense" },

    // Public cannot access cyber defense
    { trustZone: "public", workflow: "cyber-defense" },

    //
    // FARMER RESTRICTIONS
    //
    { trustZone: "farmer", workflow: "aim-contractor" },
    { trustZone: "farmer", workflow: "aim-gov" },
    { trustZone: "farmer", workflow: "aim-defense" },
    { trustZone: "farmer", workflow: "cyber-defense" },

    //
    // CONTRACTOR RESTRICTIONS
    //
    { trustZone: "contractor", workflow: "aim-farmer" },
    { trustZone: "contractor", workflow: "aim-gov" },
    { trustZone: "contractor", workflow: "aim-defense" },
    { trustZone: "contractor", workflow: "cyber-defense" },

    //
    // APPS RESTRICTIONS
    //
    { trustZone: "apps", workflow: "aim-gov" },
    { trustZone: "apps", workflow: "aim-defense" },
    { trustZone: "apps", workflow: "cyber-defense" }

    //
    // GOV + SYSTEM have NO blocks here.
    // They are allowed to run:
    // - aim-gov
    // - aim-defense
    // - cyber-defense
    // - gov-intel
    // - system-heartbeat
    //
  ];

  const hit = blocked.find(
    r => r.trustZone === trustZone && r.workflow === workflow
  );

  // Allowed → exit early
  if (!hit) return { allowed: true };

  // Blocked → log to Cyber DB
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
