// /workers/system/system-health.js
// GIA Sovereign Health Engine – V12 Alpha

import systemManifest from "../../config/system-manifest.json" assert { type: "json" };
import nodeRegistry from "../../config/node-registry.json" assert { type: "json" };
import clusterHealth from "../../config/cluster-health.json" assert { type: "json" };
import { sha256 } from "../../utils/context.js";

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
  const start = Date.now();

  // Worker health
  const workers = {
    system: !!context.env?.SYSTEM,
    admin: !!context.env?.ADMIN,
    public: !!context.env?.PUBLIC,
    contractor: !!context.env?.CONTRACTOR,
    farmer: !!context.env?.FARMER,
    gov: !!context.env?.GOV,
    deepgov: !!context.env?.DEEPGOV
  };

  // Storage health
  const storage = {
    d1: !!context.env?.DB,
    kv: !!context.env?.KV,
    cache: !!context.env?.CACHE
  };

  // AI subsystem health
  const ai = {
    engineAvailable: typeof context.env?.AI?.run === "function",
    decisionEngine: "/api/decision",
    cortex: "/api/cortex",
    deepMind: "/api/deep-mind",
    status: typeof context.env?.AI?.run === "function" ? "ready" : "offline"
  };

  // Node registry
  const nodes = nodeRegistry.clusters.map(c => ({
    name: c.name,
    sector: c.sector,
    hostname: c.hostname,
    port: c.port,
    tls: c.tls
  }));

  // Cluster health
  const clusters = clusterHealth.clusters.map(c => ({
    name: c.name,
    sector: c.sector,
    status: c.status,
    health_score: c.health_score
  }));

  // Platform metadata
  const platform = {
    id: systemManifest.platform_id,
    version: systemManifest.version,
    failsafe: systemManifest.failsafe_level,
    active_sectors: systemManifest.active_sectors,
    endpoints: systemManifest.endpoints
  };

  // Compute latency
  const latency = Date.now() - start;

  // Sovereign health score
  const healthy =
    latency < 500 &&
    ai.engineAvailable &&
    storage.d1 &&
    workers.system;

  // Build sovereign health report
  const report = {
    ok: healthy,
    type: "system-health",
    status: healthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),

    metrics: {
      latency,
      uptime: context.env?.UPTIME || "unknown"
    },

    platform,
    workers,
    storage,
    ai,
    nodes,
    clusters,

    context: {
      trustZone: "system",
      workflow: "system-health"
    },

    notes: "Sovereign Health Engine V12 Alpha: AI, storage, workers, and cluster state determine health."
  };

  // Integrity hash
  report.integrity = {
    hash: await sha256(JSON.stringify(report)),
    verified: true
  };

  return json(report);
}
