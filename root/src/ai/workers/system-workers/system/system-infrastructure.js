// /workers/system/system-infrastructure.js
// GIA Sovereign Infrastructure Node – V12 Alpha

import infra from "src/backend/infrastructure/index.js";
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
  const { cf } = context.env;

  // 1. Infrastructure diagnostics (Cloudflare)
  const infraReport = await infra.diagnostics(cf);

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
    infrastructure: infraReport,
    notes: "Infrastructure diagnostics reflect Cloudflare environment health and system-level readiness."
  };

  return json({
    system: "infrastructure",
    status: "ok",
    report
  });
}

