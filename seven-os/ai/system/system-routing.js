// /workers/system/system-routing.js
// GIA Sovereign Routing Inspector – V12 Alpha

import { inspectRouting } from "../../backend/security/tools/inspect-routing.js";
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
  const { cf, ai } = context.env;

  // 1. Routing inspector (trust‑zone + worker + AI routing)
  const routingReport = await inspectRouting(context.request.url, cf, ai);

  // 2. Platform metadata
  const platform = {
    id: systemManifest.platform_id,
    version: systemManifest.version,
    failsafe: systemManifest.failsafe_level,
    active_sectors: systemManifest.active_sectors,
    endpoints: systemManifest.endpoints
  };

  // 3. Node registry
  const nodes = nodeRegistry.clusters.map(c => ({
    name: c.name,
    sector: c.sector,
    hostname: c.hostname,
    port: c.port,
    tls: c.tls
  }));

  // 4. Cluster health
  const clusters = clusterHealth.clusters.map(c => ({
    name: c.name,
    sector: c.sector,
    status: c.status,
    health_score: c.health_score
  }));

  // 5. Final report
  const report = {
    timestamp: new Date().toISOString(),
    platform,
    nodes,
    clusters,
    routing: routingReport,
    notes: "Routing inspector validates trust‑zones, worker bindings, AI surfaces, and sovereign routing policy."
  };

  return json({
    system: "routing",
    status: "ok",
    report
  });
}
