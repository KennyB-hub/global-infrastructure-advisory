// /workers/system/system-security.js
// GIA Sovereign Security Node – V12 Alpha

import { inspectRouting } from "../../security/tools/inspect-routing.js";
import { threatScan } from "../../security/tools/threat-scan.js";

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

  //
  // 1. SECURITY TOOLS (Threat Scan + Routing Inspector)
  //
  const [threats, routing] = await Promise.all([
    threatScan(cf, ai),
    inspectRouting(context.request.url, cf, ai)
  ]);

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
  // 5. AI SUBSYSTEM SECURITY STATUS
  //
  const aiSecurity = {
    decisionEngine: "/api/decision",
    cortex: "/api/cortex",
    deepMind: "/api/deep-mind",
    engineAvailable: typeof ai?.run === "function",
    status: typeof ai?.run === "function" ? "ready" : "offline"
  };

  //
  // 6. FINAL SECURITY REPORT
  //
  const report = {
    timestamp: new Date().toISOString(),
    platform,
    nodes,
    clusters,
    threats,
    routing,
    ai: aiSecurity,
    notes:
      "Security node evaluates threat intelligence, routing anomalies, AI subsystem readiness, and sovereign policy compliance."
  };

  return json({
    system: "security",
    status: "ok",
    report
  });
}
