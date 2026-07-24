// /workers/system/system-status.js
// GIA Sovereign System Status Node – V12 Alpha

import { systemStatusReport } from "seven-os/backend/system/system-status.js";

import systemManifest from "../../config/system-manifest.json" assert { type: "json" };
import nodeRegistry from "../../backend/config/node-registry.json" assert { type: "json" };
import clusterHealth from "../../config/cluster-health.json" assert { type: "json" };
import { EngineeringEngine } from "../engines/engineering-engine.js";
import { MechanicsEngine } from "../../sector/engines/mechanics-engine.js";

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
  const manifest = context.env?.MANIFEST || {};

  //
  // 1. BASE SYSTEM STATUS (Deep Mind 2100)
  //
  const baseStatus = systemStatusReport(manifest);

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
  // 5. AI SUBSYSTEM STATUS
  //
  const ai = {
    decisionEngine: "/api/decision",
    cortex: "/api/cortex",
    deepMind: "/api/deep-mind",
    engineAvailable: typeof context.env?.AI?.run === "function",
    status: typeof context.env?.AI?.run === "function" ? "ready" : "offline"
  };

  //
  // 6. FINAL STATUS REPORT
  //
  const report = {
    timestamp: new Date().toISOString(),
    platform,
    nodes,
    clusters,
    ai,
    base: baseStatus,
    notes: "System status reflects the Sovereign AI runtime state and platform readiness."
  };

  const engineeringEngine = new EngineeringEngine();
  const mechanicsEngine = new MechanicsEngine();

  // ---------------------------------------------------------
// SYSTEM: Engineering Report
// ---------------------------------------------------------
if (url.pathname === "/system/engineering-report" && request.method === "POST") {
  try {
    const body = await request.json();

    const input = {
      domain: body.domain,
      system: body.system,
      data: body.data || {},
      trustZone: "system",
      workflow: "engineering-analysis"
    };

    const report = await engineeringEngine.process(input, env, {
      trustZone: "system",
      workflow: "engineering-analysis"
    });

    return json(report);
  } catch (err) {
    return json({ error: "Engineering Engine Failure", details: err.message }, 500);
  }
}

  return json({
    system: "status",
    status: "ok",
    report
  });
}
