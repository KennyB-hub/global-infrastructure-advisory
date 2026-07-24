// /workers/system/system-domains.js
// GIA Sovereign System Domains Node – V12 Alpha

import { getDomainStatus } from "seven-os/backend/system/domains.js";
import systemManifest from "../../config/system-manifest.json" assert { type: "json" };
import nodeRegistry from "../../backend/config/node-registry.json" assert { type: "json" };
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
  const domainReport = getDomainStatus();

  const report = {
    timestamp: new Date().toISOString(),

    platform: {
      id: systemManifest.platform_id,
      version: systemManifest.version,
      failsafe: systemManifest.failsafe_level,
      active_sectors: systemManifest.active_sectors
    },

    domains: domainReport,

    nodes: nodeRegistry.clusters.map(c => ({
      name: c.name,
      sector: c.sector,
      hostname: c.hostname,
      port: c.port,
      tls: c.tls
    })),

    clusters: clusterHealth.clusters.map(c => ({
      name: c.name,
      sector: c.sector,
      status: c.status,
      health_score: c.health_score
    })),

    notes: "Domain registry is part of the Sovereign System Layer. All domain operations must be validated through system trust policies."
  };

  return json({
    system: "domains",
    status: "ok",
    report
  });
}
