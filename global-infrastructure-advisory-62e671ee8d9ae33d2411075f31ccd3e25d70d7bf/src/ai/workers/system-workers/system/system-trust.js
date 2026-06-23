// /workers/system/system-trust.js
// GIA Sovereign Trust Zone Node – V12 Alpha

import { getTrustZones } from "src/backend/system/trust.js";

import systemManifest from "../../config/system-manifest.json" assert { type: "json" };
import nodeRegistry from "../../config/node-registry.json" assert { type: "json" };
import clusterHealth from "../../config/cluster-health.json" assert { type: "json" };

// Unified JSON responder
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

export async function onRequest(context) {
  //
  // 1. TRUST ZONE MAP (public, contractor, farmer, gov, deepgov, admin, system)
  //
  const trustZones = getTrustZones();

  //
  // 2. PLATFORM METADATA
  //
  const platform = {
    id: systemManifest.platform_id,
    version: systemManifest.version,
    failsafe: systemManifest.failsafe_level,
    active_sectors: systemManifest.active_sectors,
    endpoints: systemManifest.endpoints
  };

  //
  // 3. NODE REGISTRY
  //
  const nodes = nodeRegistry.clusters.map(c => ({
    name: c.name,
    sector: c.sector,
    hostname: c.hostname,
    port: c.port,
    tls: c.tls
  }));

  //
  // 4. CLUSTER HEALTH
  //
  const clusters = clusterHealth.clusters.map(c => ({
    name: c.name,
    sector: c.sector,
    status: c.status,
    health_score: c.health_score
  }));

  //
  // 5. AI SUBSYSTEM TRUST CONTEXT
  //
  const ai = {
    decisionEngine: "/api/decision",
    cortex: "/api/cortex",
    deepMind: "/api/deep-mind",
    engineAvailable: typeof context.env?.AI?.run === "function",
    status: typeof context.env?.AI?.run === "function" ? "ready" : "offline"
  };

  //
  // 6. FINAL TRUST REPORT
  //
  const report = {
    timestamp: new Date().toISOString(),
    platform,
    nodes,
    clusters,
    trustZones,
    ai,
    notes:
      "Trust zones define sovereign access boundaries. All routing, AI execution, and system operations must comply with trust-zone policy."
  };

  return json({
    system: "trust",
    status: "ok",
    report
  });
}
