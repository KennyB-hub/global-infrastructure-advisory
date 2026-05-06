// /workers/system/index.js
// GIA Sovereign System Node – V12 Alpha

import systemManifest from "../../src/config/system-manifest.json" assert { type: "json" };
import nodeRegistry from "../../src/config/node-registry.json" assert { type: "json" };
import clusterHealth from "../../src/config/cluster-health.json" assert { type: "json" };

import * as status from "./system-status.js";
import * as full from "./system-full-report.js";
import * as domains from "./system-domains.js";
import * as trust from "./system-trust.js";
import * as uptime from "./system-uptime.js";
import * as infra from "./system-infrastructure.js";
import * as storage from "./system-storage.js";
import * as routing from "./system-routing.js";
import * as health from "./system-health.js";
import * as security from "./system-security.js";
import * as ai from "./system-ai.js";
import * as map from "./system-map.js";

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

// Node resolver
function resolveNode(sector) {
  if (!sector) return null;
  const s = String(sector).toUpperCase();
  return nodeRegistry.clusters.find(c => c.sector.toUpperCase() === s) || null;
}

// Routing table for Inspector
const SYSTEM_ROUTING_TABLE = {
  "/system/status": "System Status",
  "/system/full-report": "Full System Report",
  "/system/domains": "Domain Registry",
  "/system/trust": "Trust Zone Map",
  "/system/uptime": "Uptime",
  "/system/infrastructure": "Infrastructure Map",
  "/system/storage": "Storage Map",
  "/system/routing": "Routing Map",
  "/system/health": "Health Report",
  "/system/security": "Security Report",
  "/system/ai": "AI Subsystem Report",
  "/system/map": "System Map"
};

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // -----------------------------------------
  // 1. SYSTEM ENDPOINT ROUTING
  // -----------------------------------------
  if (path.endsWith("/status")) return status.onRequest(context);
  if (path.endsWith("/full-report")) return full.onRequest(context);
  if (path.endsWith("/domains")) return domains.onRequest(context);
  if (path.endsWith("/trust")) return trust.onRequest(context);
  if (path.endsWith("/uptime")) return uptime.onRequest(context);
  if (path.endsWith("/infrastructure")) return infra.onRequest(context);
  if (path.endsWith("/storage")) return storage.onRequest(context);
  if (path.endsWith("/routing")) return routing.onRequest(context);
  if (path.endsWith("/health")) return health.onRequest(context);
  if (path.endsWith("/security")) return security.onRequest(context);
  if (path.endsWith("/ai")) return ai.onRequest(context);
  if (path.endsWith("/map")) return map.onRequest(context);

  // -----------------------------------------
  // 2. SYSTEM INDEX (NEW — V12 Alpha)
  // -----------------------------------------
  if (path === "/system" || path === "/system/") {
    return json({
      system: "GIA System Node",
      platform: {
        id: systemManifest.platform_id,
        version: systemManifest.version,
        failsafe: systemManifest.failsafe_level,
        active_sectors: systemManifest.active_sectors,
        endpoints: systemManifest.endpoints
      },
      nodes: nodeRegistry.clusters,
      clusters: clusterHealth.clusters,
      routing: SYSTEM_ROUTING_TABLE,
      timestamp: new Date().toISOString()
    });
  }

  // -----------------------------------------
  // 3. FALLBACK
  // -----------------------------------------
  return json(
    {
      system: "router",
      status: "not-found",
      path
    },
    404
  );
}
