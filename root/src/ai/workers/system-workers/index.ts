// ---------------------------------------------------------
//  Core Imports
// ---------------------------------------------------------
import { handleApiRequest } from "../../../backend/functions/api/index.js";
import { getTrustZone, checkTrust } from "../../../backend/system/trust-middleware.js";

import * as organizerWorker from "./organizer/index.js";
import * as expansionWorker from "./expansion/index.js";
import * as anysWorker from "./anys/index.js";

import * as publicWorker from "./public/index.js";
import * as contractorWorker from "./contractor/index.js";
import * as farmerWorker from "./farmer/index.js";
import * as govWorker from "./gov/index.js";
import * as deepgovWorker from "./deepgov/index.js";
import * as adminWorker from "./admin/index.js";
import * as systemWorker from "./system/index.js";

// NEW WORKERS
import * as govViewWorker from "./govView.worker.js";
import * as opportunityScannerWorker from "./opportunityScanner.worker.js";

import { runDecision } from "../engine/decision-engine.js";
import { Cortex } from "../../../backend/ai/cortex.js";

import systemManifest from "../config/system-manifest.json" assert { type: "json" };
import nodeRegistry from "../config/node-registry.json" assert { type: "json" };

// ---------------------------------------------------------
//  Identity + Policy Imports (NEW)
// ---------------------------------------------------------
import { resolveDID } from "../../../backend/identity/did-resolver.js";
import { verifyVC } from "../../../backend/identity/vc-verifier.js";
import { enforceMCP } from "../../../backend/system/mcp-policy.js";

// ---------------------------------------------------------
//  Unified JSON Response
// ---------------------------------------------------------
function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "GIA-Platform-ID": systemManifest.platform_id,
      "GIA-Version": systemManifest.version,
      ...extraHeaders
    }
  });
}

// ---------------------------------------------------------
//  Worker Routing Table
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

  // NEW WORKERS
  govview: govViewWorker,
  opportunity: opportunityScannerWorker
};

// ---------------------------------------------------------
//  Main System Worker Handler
// ---------------------------------------------------------
export async function handleSystemRequest(request, env, ctx) {
  try {
    const url = new URL(request.url);
    const trustZone = getTrustZone(url.pathname);

    // ---------------------------------------------------------
    //  Identity: DID + VC + MCP Enforcement
    // ---------------------------------------------------------
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    const did = await resolveDID(authHeader);
    if (!did.valid) {
      return json({ error: "Invalid DID", details: did.reason }, 401);
    }

    const vc = await verifyVC(did);
    if (!vc.valid) {
      return json({ error: "Invalid VC", details: vc.reason }, 403);
    }

    const mcp = await enforceMCP({
      did,
      vc,
      trustZone,
      path: url.pathname,
      method: request.method
    });

    if (!mcp.allowed) {
      return json({ error: "MCP Policy Denied", details: mcp.reason }, 403);
    }

    // ---------------------------------------------------------
    //  Worker Selection
    // ---------------------------------------------------------
    const workerId = url.pathname.split("/")[2];
    const worker = workerMap[workerId];

    if (!worker) {
      return json({ error: "Unknown worker", workerId }, 404);
    }

    // ---------------------------------------------------------
    //  Execute Worker Logic
    // ---------------------------------------------------------
    const body = request.method !== "GET" ? await request.json().catch(() => ({})) : {};
    const result = await worker.handle?.(body, { did, vc, mcp, env, ctx });

    // ---------------------------------------------------------
    //  Unified Response with Identity Metadata
    // ---------------------------------------------------------
    return json(result, 200, {
      "DID-Subject": did.subject,
      "VC-Role": vc.role,
      "MCP-Policy": mcp.policy
    });

  } catch (err) {
    return json({ error: "System Worker Failure", details: err.message }, 500);
  }
}
