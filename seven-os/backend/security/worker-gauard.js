// GIA Sovereign Worker Guard – V12 Alpha
// Protects AI entrypoints, system endpoints, trust‑zones, and auto‑blocking

import { sha256 } from "../../ai-engines/utils/crypto.js";
import { PolicyEngine } from "../../system/policy-engine.js";
import { DBService } from "../../system/db/db-service.js";

const policy = new PolicyEngine();

export async function sovereignWorkerGuard(request, env) {
  try {
    const url = new URL(request.url);
    const db = new DBService(env);

    //
    // 1. Extract identifiers
    //
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const ua = request.headers.get("User-Agent") || "";
    const sessionKey = request.headers.get("X-Session-Key") || null;

    //
    // 2. Cyber Auto‑Block (KV)
    //
    const ipBlocked = await db.getKV("cyber-blocks", `ip:${ip}`);
    if (ipBlocked === "blocked") {
      return _deny("CYBER_AUTO_BLOCK_IP", { ip });
    }

    if (sessionKey) {
      const keyBlocked = await db.getKV("cyber-blocks", `key:${sessionKey}`);
      if (keyBlocked === "blocked") {
        return _deny("CYBER_AUTO_BLOCK_SESSION", { sessionKey });
      }
    }

    //
    // 3. Block unsafe methods
    //
    if (!["GET", "POST", "OPTIONS"].includes(request.method)) {
      return _deny("METHOD_NOT_ALLOWED");
    }

    //
    // 4. Block malformed JSON early
    //
    if (request.method === "POST") {
      const contentType = request.headers.get("Content-Type") || "";
      if (!contentType.includes("application/json")) {
        return _deny("INVALID_CONTENT_TYPE");
      }
    }

    //
    // 5. Extract trust zone (default: public)
    //
    const trustZone = request.headers.get("GIA-Trust-Zone") || "public";

    //
    // 6. Detect workflow from URL
    //
    const workflow = _detectWorkflow(url.pathname);

    //
    // 7. Policy enforcement (workflow-level)
    //
    const decision = policy.check({
      trustZone,
      workflow,
      action: "invoke"
    });

    if (!decision.allowed) {
      return _deny("AI_POLICY_BLOCKED", { trustZone, workflow });
    }

    //
    // 8. Rate-limit → Auto-block escalation
    //
    const rateKey = `rate:${ip}`;
    const hits = Number(await db.getKV("cyber-rate", rateKey)) || 0;

    if (hits > 200) {
      await db.putKV("cyber-blocks", `ip:${ip}`, "blocked", 3600);
      return _deny("CYBER_RATE_BLOCK", { ip });
    }

    await db.putKV("cyber-rate", rateKey, String(hits + 1), 60);

    //
    // 9. Passed all checks
    //
    return null;

  } catch (err) {
    return _deny("SECURITY_GUARD_FAILURE", { error: err.message });
  }
}

//
// INTERNAL HELPERS
//

function _detectWorkflow(path) {
  if (path.startsWith("/system/engineering-report")) return "engineering-analysis";
  if (path.startsWith("/system/mechanics-report")) return "mechanics-analysis";
  if (path.startsWith("/system/sector-report")) return "sector-analysis";
  if (path.startsWith("/api/decision")) return "decision";
  if (path.startsWith("/api/geo")) return "geo";
  if (path.startsWith("/api/utility")) return "utility";
  return "general";
}

function _deny(reason, meta = {}) {
  const payload = {
    ok: false,
    type: "security-deny",
    reason,
    meta,
    timestamp: new Date().toISOString()
  };

  payload.integrity = {
    hash: sha256(JSON.stringify(payload)),
    verified: true
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 403,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
