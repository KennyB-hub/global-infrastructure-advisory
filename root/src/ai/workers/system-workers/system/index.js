// /workers/system/index.js
// GIA Sovereign System Worker – V12 Alpha
// Highest‑authority civilian worker (below DeepGov)

import { basicSecurityGuard } from "../../src/security/worker-guard.js";
import { PolicyEngine } from "../../src/ai-engine/policy-engine.js";
import { sha256 } from "../../src/ai-engine/utils/crypto.js";
import * as cyberWorker from "./cyber/index.js";

const policy = new PolicyEngine();

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "GIA-Trust-Zone": "system",
      "GIA-Version": "v12-alpha"
    }
  });
}

export async function onRequest(context) {
  const request = context.request;
  const env = context.env;
  const url = new URL(request.url);
  const workerMap = {
  public: publicWorker,
  contractor: contractorWorker,
  farmer: farmerWorker,
  gov: govWorker,
  deepgov: deepgovWorker,
  admin: adminWorker,
  system: systemWorker,
  expansion: expansionWorker,
  organizer: organizerWorker,
  anys: anysWorker,
  govview: govViewWorker,
  opportunity: opportunityScannerWorker,
  cyber: cyberWorker
};

  //
  // 1. Worker Guard (V12 Alpha)
  //
  const guard = basicSecurityGuard(request, env);
  if (guard) return guard;

  //
  // 2. Extract trust zone
  //
  const trustZone = request.headers.get("GIA-Trust-Zone") || "public";

  //
  // 3. Policy check for system workflows
  //
  const decision = await policy.check({
    trustZone,
    workflow: "system-access",
    action: "view"
  });

  if (!decision.allowed) {
    return json(
      {
        ok: false,
        type: "policy-deny",
        reason: decision.reason,
        trustZone,
        workflow: "system-access",
        timestamp: new Date().toISOString(),
        integrity: {
          hash: await sha256(JSON.stringify(decision)),
          verified: true
        }
      },
      403
    );
  }

  //
  // 4. /system/status
  //
  if (url.pathname.endsWith("/system/status")) {
    const payload = {
      ok: true,
      zone: "system",
      endpoint: "status",
      status: "operational",
      uptime: env.SYSTEM_UPTIME || "unknown",
      timestamp: new Date().toISOString(),
      meta: {
        trustZone,
        workflow: "system-access",
        version: "v12-alpha"
      }
    };

    payload.integrity = {
      hash: await sha256(JSON.stringify(payload)),
      verified: true
    };

    return json(payload);
  }

  //
  // 5. /system/diagnostics
  //
  if (url.pathname.endsWith("/system/diagnostics")) {
    const payload = {
      ok: true,
      zone: "system",
      endpoint: "diagnostics",
      cpu: env.SYSTEM_CPU || "unknown",
      memory: env.SYSTEM_MEMORY || "unknown",
      workers: env.SYSTEM_WORKERS || "unknown",
      timestamp: new Date().toISOString(),
      meta: {
        trustZone,
        workflow: "system-access",
        version: "v12-alpha"
      }
    };

    payload.integrity = {
      hash: await sha256(JSON.stringify(payload)),
      verified: true
    };

    return json(payload);
  }

  //
  // 6. /system/full-report
  //
  if (url.pathname.endsWith("/system/full-report")) {
    const payload = {
      ok: true,
      zone: "system",
      endpoint: "full-report",
      system: {
        uptime: env.SYSTEM_UPTIME || "unknown",
        cpu: env.SYSTEM_CPU || "unknown",
        memory: env.SYSTEM_MEMORY || "unknown",
        workers: env.SYSTEM_WORKERS || "unknown"
      },
      ai: {
        version: "v12-alpha",
        router: "active",
        engines: [
          "decision",
          "engineering",
          "mechanics",
          "science",
          "geothermal",
          "renewables",
          "building-code",
          "zoning",
          "sector-analysis"
        ]
      },
      timestamp: new Date().toISOString(),
      meta: {
        trustZone,
        workflow: "system-access",
        version: "v12-alpha"
      }
    };

    payload.integrity = {
      hash: await sha256(JSON.stringify(payload)),
      verified: true
    };

    return json(payload);
  }

  //
  // 7. Fallback
  //
  const fallback = {
    ok: false,
    zone: "system",
    status: "not-found",
    path: url.pathname,
    timestamp: new Date().toISOString(),
    meta: {
      trustZone,
      workflow: "system-access",
      version: "v12-alpha"
    }
  };

  fallback.integrity = {
    hash: await sha256(JSON.stringify(fallback)),
    verified: true
  };

  return json(fallback, 404);
}
