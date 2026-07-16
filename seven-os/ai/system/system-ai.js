// /workers/system/system-ai.js
// GIA Sovereign AI Routing Node – V12 Alpha

import { getAiRoutingMap } from "../../system/ai-routing.js";
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

export async function onRequest() {
  const routing = getAiRoutingMap();

  // Cortex metadata (V12 Alpha)
  const cortex = {
    version: "V12-Alpha",
    organs: [
      "infrastructure",
      "security",
      "services",
      "workers/system",
      "workers/admin",
      "workers/public",
      "decision-engine",
      "cortex-engine"
    ],
    safeSurfaces: [
      "/system/status",
      "/system/infrastructure",
      "/system/storage",
      "/system/routing",
      "/system/full-report",
      "/system/security",
      "/system/map",
      "/system/health"
    ],
    guardedSurfaces: [
      "/api/decision",
      "/api/cortex",
      "/api/deep-mind",
      "/admin/*",
      "/system/*"
    ],
    adminEndpoints: [
      "/admin/login",
      "/admin/users",
      "/admin/metrics",
      "/admin-endpoints.js"
    ],
    notes: "Cortex V12 must treat all write-capable or AI-execution endpoints as guarded surfaces requiring explicit sovereign policy."
  };

  const report = {
    timestamp: new Date().toISOString(),
    platform: {
      id: systemManifest.platform_id,
      version: systemManifest.version,
      failsafe: systemManifest.failsafe_level,
      active_sectors: systemManifest.active_sectors,
      endpoints: systemManifest.endpoints
    },
    nodes: nodeRegistry.clusters,
    clusters: clusterHealth.clusters,
    routing,
    cortex
  };

  return json({
    system: "ai-routing",
    status: "ok",
    report
  });
}
