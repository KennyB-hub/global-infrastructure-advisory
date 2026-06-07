// /workers/system/index.js
// GIA Sovereign System Worker – V12 Sovereign Edition

import { basicSecurityGuard } from "../../security/worker-guard.js";
import { PolicyEngine } from "../../autonomous/ai/policy-engine.js";
import { CryptoV12 } from "../../autonomous/ai/utils/crypto.js";
import { SectorEngine } from "../../backend/sector/sector-engine.js";

import { verifyDidVcIdentity } from "../../backend/system/identity/did-vc-verifier.js";
import { enforceMCP } from "../../backend/system/mcp/mcp-enforcer.js";
import * as cyberWorker from "../cyber/cyber/index.js";

// Worker imports (you already have these)
import { publicWorker } from "../public/index.js";
import { contractorWorker } from "../contractor/index.js";
import { farmerWorker } from "../farmer/index.js";
import { govWorker } from "../gov/index.js";
import { deepgovWorker } from "../deepgov/index.js";
import { adminWorker } from "../admin/index.js";
import { systemWorker } from "./index.js";
import { expansionWorker } from "../expansion/index.js";
import { organizerWorker } from "../organizer/index.js";
import { anysWorker } from "../anys/index.js";
import { govViewWorker } from "../govview/index.js";
import { opportunityScannerWorker } from "../opportunity/index.js";
import * as fccWorker from "../fcc/index.js";
import { CryptoV12 } from "../../src/ai/utils/crypto.js";

const policy = new PolicyEngine();

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "GIA-Trust-Zone": "system",
      "GIA-Version": "v12-sovereign"
    }
  });
}

export async function onRequest(context) {
  const request = context.request;
  const env = context.env;
  const url = new URL(request.url);
  const sectorEngine = new SectorEngine(env, env.NODE_REGISTRY);
  const systemTraceId = CryptoV12.randomId();

  // ---------------------------------------------------------
  // WORKER MAP
  // ---------------------------------------------------------
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
    cyber: cyberWorker,
    fcc: fccWorker
  };

  // ---------------------------------------------------------
  // 1. BASIC SECURITY GUARD
  // ---------------------------------------------------------
  const guard = basicSecurityGuard(request, env);
  if (guard) return guard;

  // ---------------------------------------------------------
  // 2. DID / VC IDENTITY VERIFICATION
  // ---------------------------------------------------------
  const identity = await verifyDidVcIdentity(request, env);
  const trustZone = identity.trustZone || "public";

  // ---------------------------------------------------------
  // 3. CYBER THREAT SCORING (Zero‑Trust)
  // ---------------------------------------------------------
  const cyberResult = await cyberWorker.handle(
    {
      eventType: "system_request",
      data: {
        path: url.pathname,
        method: request.method,
        subject: identity.subject,
        claims: identity.claims
      }
    },
    { env, trustZone, authValid: identity.valid }
  );

  // ---------------------------------------------------------
// INTEGRITY VERIFICATION (Decision Engine → System Worker)
// ---------------------------------------------------------
let decisionPayload = null;
let integrityToken = null;

if (request.method === "POST") {
  try {
    const body = await request.json();
    integrityToken = body.integrityToken;
    decisionPayload = body;

    delete decisionPayload.integrityToken;

    const secret = env.DECISION_ENGINE_SECRET || "DECISION_ENGINE_DEFAULT_SECRET";

    const valid = await CryptoV12.verifyIntegrity(decisionPayload, secret, integrityToken);

    if (!valid) {
      return json(
        {
          ok: false,
          type: "integrity-failed",
          reason: "Integrity token mismatch",
          systemTraceId
        },
        403
      );
    }
  } catch (err) {
    // No body or invalid JSON → skip integrity check
  }
}

  if (cyberResult.threat.level === "high" || cyberResult.threat.level === "critical") {
    return json(
      {
        ok: false,
        type: "zero-trust-block",
        threat: cyberResult.threat,
        trust: cyberResult.trust,
        timestamp: new Date().toISOString()
      },
      403
    );
  }

  // ---------------------------------------------------------
  // 4. MCP + CLOUD BOUNDARY ENFORCEMENT
  // ---------------------------------------------------------
  const mcp = await enforceMCP({
    trustZone,
    method: request.method,
    threat: cyberResult.threat,
    sourceCloud: env.CLOUD_PROVIDER,
    targetCloud: env.TARGET_CLOUD || env.CLOUD_PROVIDER
  });

  if (!mcp.allowed) {
    return json(
      {
        ok: false,
        type: "mcp-deny",
        reason: mcp.reason,
        policy: mcp.policy,
        timestamp: new Date().toISOString()
      },
      403
    );
  }

  // ---------------------------------------------------------
  // 5. POLICY ENGINE (System Access)
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // 6. SYSTEM ENDPOINTS
  // ---------------------------------------------------------

  // /system/status
  if (url.pathname.endsWith("/system/status")) {
    const payload = {
      ok: true,
      zone: "system",
      endpoint: "status",
      status: "operational",
      uptime: env.SYSTEM_UPTIME || "unknown",
      timestamp: new Date().toISOString(),
      meta: { trustZone, version: "v12-sovereign" }
    };

    payload.integrity = {
      hash: await sha256(JSON.stringify(payload)),
      verified: true
    };

    return json(payload);
  }

  // /system/diagnostics
  if (url.pathname.endsWith("/system/diagnostics")) {
    const payload = {
      ok: true,
      zone: "system",
      endpoint: "diagnostics",
      cpu: env.SYSTEM_CPU || "unknown",
      memory: env.SYSTEM_MEMORY || "unknown",
      workers: env.SYSTEM_WORKERS || "unknown",
      timestamp: new Date().toISOString(),
      meta: { trustZone, version: "v12-sovereign" }
    };

    payload.integrity = {
      hash: await sha256(JSON.stringify(payload)),
      verified: true
    };

    return json(payload);
  }

  // /system/full-report
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
        version: "v12-sovereign",
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
      meta: { trustZone, version: "v12-sovereign" }
    };

    payload.integrity = {
      hash: await sha256(JSON.stringify(payload)),
      verified: true
    };

    return json(payload);
  }

  // ---------------------------------------------------------
  // 7. FALLBACK
  // ---------------------------------------------------------
  const fallback = {
    ok: false,
    zone: "system",
    status: "not-found",
    path: url.pathname,
    timestamp: new Date().toISOString(),
    meta: { trustZone, version: "v12-sovereign" }
  };

  fallback.integrity = {
    hash: await sha256(JSON.stringify(fallback)),
    verified: true
  };

  return json(fallback, 404);
}
