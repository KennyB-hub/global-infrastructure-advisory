// /workers/system/system-uptime.js
// GIA Sovereign Uptime Node – V12 Alpha

import { getUptime } from "src/backend/system/uptime.js";
import { EngineeringEngine } from "./engineering-engine.js";
import { MechanicsEngine } from "./mechanics-engine.js";
import systemManifest from "../config/system-manifest.json" assert { type: "json" };
import nodeRegistry from "../config/node-registry.json" assert { type: "json" };
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

// ---------------------------------------------------------
// SYSTEM: Mechanics Report
// ---------------------------------------------------------
if (url.pathname === "/system/mechanics-report" && request.method === "POST") {
  try {
    const body = await request.json();

    const input = {
      category: body.category,
      system: body.system,
      data: body.data || {},
      trustZone: "system",
      workflow: "mechanics-analysis"
    };

    const report = await mechanicsEngine.process(input, env, {
      trustZone: "system",
      workflow: "mechanics-analysis"
    });

    return json(report);
  } catch (err) {
    return json({ error: "Mechanics Engine Failure", details: err.message }, 500);
  }
}

export async function onRequest(context) {
  //
  // 1. BASE UPTIME REPORT
  //
  const uptime = getUptime();

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

    const engineeringEngine = new EngineeringEngine();
    const mechanicsEngine = new MechanicsEngine();

    const report = await engineeringEngine.process(input, env, {
      trustZone: "system",
      workflow: "engineering-analysis"
    });

    return json(report);
  } catch (err) {
    return json({ error: "Engineering Engine Failure", details: err.message }, 500);
  }
}

  //
  // 6. FINAL UPTIME REPORT
  //
  const report = {
    timestamp: new Date().toISOString(),
    platform,
    nodes,
    clusters,
    uptime,
    ai,
    notes:
      "Uptime node reflects system runtime stability and AI subsystem readiness. All uptime signals feed the Sovereign Health Engine."
  };

  return json({
    system: "uptime",
    status: "ok",
    report
  });
}
