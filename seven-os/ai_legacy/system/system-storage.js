// /workers/system/system-storage.js
// GIA Sovereign Storage Node – V12 Alpha

import { storageInspector } from "seven-os/backend/infrastructure/tools/storage-inspector.js";

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

  //
  // 1. STORAGE DIAGNOSTICS (KV, R2, D1)
  //
  const storageReport = await storageInspector(cf);

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
  // 5. FINAL STORAGE REPORT
  //
  const report = {
    timestamp: new Date().toISOString(),
    platform,
    nodes,
    clusters,
    storage: storageReport,
    notes:
      "Storage node inspects KV, R2, and D1 health. All storage operations must comply with sovereign data policy."
  };

  return json({
    system: "storage",
    status: "ok",
    report
  });
}
