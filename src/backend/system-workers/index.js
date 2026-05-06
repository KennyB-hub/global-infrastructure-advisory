// GIA Sovereign Gateway Entry – V12 Alpha
// Unifies: API Routing, Trust‑Zone Routing, Decision Engine, Cortex, System Workers

import { handleApiRequest } from "../functions/api/index.js";
import { getTrustZone, checkTrust } from "../system/trust-middleware.js";

import * as publicWorker from "./public/index.js";
import * as contractorWorker from "./contractor/index.js";
import * as farmerWorker from "./farmer/index.js";
import * as govWorker from "./gov/index.js";
import * as deepgovWorker from "./deepgov/index.js";
import * as adminWorker from "./admin/index.js";
import * as systemWorker from "./system/index.js";

import { runDecision } from "../engine/decision-engine.js";
import { Cortex } from "../ai/cortex.js";

import systemManifest from "../config/system-manifest.json" assert { type: "json" };
import nodeRegistry from "../config/node-registry.json" assert { type: "json" };

// ---------------------------------------------------------
// Unified JSON Response
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
// Node Resolver (sector → physical cluster)
// ---------------------------------------------------------
function resolveNode(sector) {
  if (!sector) return null;
  const s = String(sector).toUpperCase();
  return nodeRegistry.clusters.find(c => c.sector.toUpperCase() === s) || null;
}

// ---------------------------------------------------------
// MAIN ENTRY
// ---------------------------------------------------------
export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const path = url.pathname;

  // ---------------------------------------------------------
  // 1. DECISION ENGINE (NEW)
  // ---------------------------------------------------------
  if (path === "/api/decision" && request.method === "POST") {
    try {
      const input = await request.json();
      input.trustZone = getTrustZone(path);

      const node = resolveNode(input.sector);
      const result = await runDecision(input, context.env, node);

      return json(result);
    } catch (err) {
      return json({ error: "Decision Engine Failure", details: err.message }, 500);
    }
  }

  // ---------------------------------------------------------
  // 2. AI CORTEX (NEW)
  // ---------------------------------------------------------
  if (path === "/api/cortex" && request.method === "POST") {
    try {
      const cortex = new Cortex(context.env);
      const input = await request.json();
      input.trustZone = getTrustZone(path);

      const result = await cortex.process(input);
      return json(result);
    } catch (err) {
      return json({ error: "Cortex Failure", details: err.message }, 500);
    }
  }

  // ---------------------------------------------------------
  // 3. API ROUTING (EXISTING)
  // ---------------------------------------------------------
  if (path.startsWith("/api/")) {
    try {
      return await handleApiRequest(request, context.env, context);
    } catch (err) {
      return json({ error: "API Internal Error", message: err.message }, 500);
    }
  }

  // ---------------------------------------------------------
  // 4. TRUST‑ZONE ROUTING (EXISTING)
  // ---------------------------------------------------------
  const zone = getTrustZone(path);

  if (!checkTrust(zone, request)) {
    return json({ status: "forbidden", zone, path }, 403);
  }

  if (zone === "public") return publicWorker.onRequest(context);
  if (zone === "contractor") return contractorWorker.onRequest(context);
  if (zone === "farmer") return farmerWorker.onRequest(context);
  if (zone === "gov") return govWorker.onRequest(context);
  if (zone === "deepgov") return deepgovWorker.onRequest(context);
  if (zone === "admin") return adminWorker.onRequest(context);
  if (zone === "system") return systemWorker.onRequest(context);

  // ---------------------------------------------------------
  // 5. FALLBACK
  // ---------------------------------------------------------
  return json({ status: "not-found", path }, 404);
}
