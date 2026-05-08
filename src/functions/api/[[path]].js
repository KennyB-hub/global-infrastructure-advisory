// src/functions/api/[[path]].js
// 2050 V12 Alpha — Sovereign API Worker Gateway

import { sovereignWorkerGuard } from "../../system/security/sovereign-worker-guard.js";
import { enforceAIPolicy } from "../../system/security/ai-policy.js";
import { requireKey } from "../../system/security/require-key.js";
import { Workflows } from "../../ai-engine/workflows.js";
import { DBService } from "../../system/db/db-service.js";

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/", "");

  // 1. Sovereign Worker Guard (rate limits, auto-block, method checks)
  const guard = await sovereignWorkerGuard(request, env);
  if (guard) return guard;

  // 2. Extract trust-zone + workflow
  const trustZone = request.headers.get("GIA-Trust-Zone") || "public";
  const workflow = detectWorkflow(path);

  // 3. AI Policy Engine (trust-zone vs workflow)
  const policy = await enforceAIPolicy({
    trustZone,
    workflow,
    request,
    env
  });
  if (!policy.allowed) {
    return new Response(
      JSON.stringify({ ok: false, reason: policy.reason }),
      { status: 403 }
    );
  }

  // 4. KeyEngine Hardening (keys bound to trust-zone + scope)
  const keyCheck = await requireKey(request, env, {
    trustZone,
    scope: workflow
  });
  if (!keyCheck.allowed) return keyCheck.response;

  // 5. Parse body (if POST)
  let body = {};
  if (request.method === "POST") {
    body = await request.json().catch(() => ({}));
  }

  // 6. Dispatch to AI Workflow Engine
  const wf = new Workflows(env, env.AI_TOOLS);
  const handler = wf.get(workflow);

  if (!handler) {
    return new Response(
      JSON.stringify({ ok: false, error: "UNKNOWN_WORKFLOW", workflow }),
      { status: 404 }
    );
  }

  const result = await handler(body);

  // 7. Log to Cyber DB
  const db = new DBService(env);
  await db.query(
    "system",
    `INSERT INTO security_events 
      (ts, zone, workflow, event_type, ip, ua, severity, meta)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      Date.now(),
      trustZone,
      workflow,
      "AI_WORKFLOW_EXECUTED",
      request.headers.get("CF-Connecting-IP") || null,
      request.headers.get("User-Agent") || null,
      "low",
      JSON.stringify({ path, key: keyCheck.key?.id })
    ]
  );

  // 8. Return result
  return new Response(JSON.stringify({ ok: true, result }), {
    headers: { "Content-Type": "application/json" }
  });
}

// Workflow detection
function detectWorkflow(path) {
  if (path.startsWith("gov/intel")) return "gov-intel";
  if (path.startsWith("gov/threat-model")) return "threat-model";

  if (path.startsWith("system/cyber/defense")) return "cyber-defense";

  if (path.startsWith("aim/defense")) return "aim-defense";

  if (path.startsWith("engineering-report")) return "engineering-analysis";
  if (path.startsWith("mechanics-report")) return "mechanics-analysis";
  if (path.startsWith("science-report")) return "science-analysis";

  if (path.startsWith("geo")) return "map-2d";
  if (path.startsWith("map3d")) return "map-3d";

  if (path.startsWith("blueprint")) return "blueprint";
  if (path.startsWith("document")) return "document";

  return "analyze";
}
