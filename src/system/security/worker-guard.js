// GIA Sovereign Worker Guard – V12 Alpha
// Protects AI entrypoints, system endpoints, and trust‑zone workflows

import { sha256 } from "../ai-engine/utils/crypto.js";
import { PolicyEngine } from "../ai-engine/policy-engine.js";

const policy = new PolicyEngine();

export function basicSecurityGuard(request, env) {
  try {
    const url = new URL(request.url);

    //
    // 1. Block unsafe methods
    //
    if (!["GET", "POST", "OPTIONS"].includes(request.method)) {
      return _deny("Method not allowed");
    }

    //
    // 2. Block malformed JSON early
    //
    if (request.method === "POST") {
      const contentType = request.headers.get("Content-Type") || "";
      if (!contentType.includes("application/json")) {
        return _deny("Invalid content type");
      }
    }

    //
    // 3. Extract trust zone (default: public)
    //
    const zone = request.headers.get("GIA-Trust-Zone") || "public";

    //
    // 4. Determine workflow from URL
    //
    const workflow = _detectWorkflow(url.pathname);

    //
    // 5. Policy enforcement
    //
    const decision = policy.check({
      trustZone: zone,
      workflow,
      action: "invoke"
    });

    if (!decision.allowed) {
      return _deny(decision.reason, decision);
    }

    //
    // 6. Security OK → allow router to continue
    //
    return null;

  } catch (err) {
    return _deny("Security guard failure", { error: err.message });
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
