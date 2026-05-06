// src/backend/system/system-threat-report.js
// GIA Sovereign Threat Engine – V12 Alpha

import { fetchThreatEvents, buildThreatSummary } from "../threat/threat-reporting.js";

import systemManifest from "../../config/system-manifest.json" assert { type: "json" };
import nodeRegistry from "../../config/node-registry.json" assert { type: "json" };
import clusterHealth from "../../config/cluster-health.json" assert { type: "json" };
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

export async function systemThreatReport(env = {}) {
  //
  // 1. RAW THREAT EVENTS + SUMMARY
  //
  const events = await fetchThreatEvents(env);
  const summary = buildThreatSummary(events);

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
  // 5. AI SUBSYSTEM SECURITY CONTEXT
  //
  const ai = {
    decisionEngine: "/api/decision",
    cortex: "/api/cortex",
    deepMind: "/api/deep-mind",
    engineAvailable: typeof env?.AI?.run === "function",
    status: typeof env?.AI?.run === "function" ? "ready" : "offline"
  };

  //
  // 6. FINAL SOVEREIGN THREAT REPORT
  //
  return {
    system: "GIA Threat Engine",
    status: "online",
    timestamp: new Date().toISOString(),

    platform,
    nodes,
    clusters,

    threats: {
      events,
      summary
    },

    ai,

    notes:
      "Threat Engine evaluates global threat events, anomaly patterns, routing exposure, and AI subsystem readiness. All threat intelligence feeds the Sovereign Security Node and Decision Engine."
  };
}
