// src/system/diagnostics.js
// GIA Sovereign AI Diagnostics – V12 Alpha

import systemManifest from "../config/system-manifest.json" assert { type: "json" };
import nodeRegistry from "../config/node-registry.json" assert { type: "json" };
import clusterHealth from "../config/cluster-health.json" assert { type: "json" };
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

export function diagnostics(AI, env = {}) {
  return {
    timestamp: new Date().toISOString(),

    platform: {
      id: systemManifest.platform_id,
      version: systemManifest.version,
      failsafe: systemManifest.failsafe_level,
      active_sectors: systemManifest.active_sectors
    },

    ai: {
      engineAvailable: typeof AI?.run === "function",
      modelBinding: AI?.binding || "unknown",
      azureMath: systemManifest.endpoints?.azure_math || null,
      azureGeo: systemManifest.endpoints?.azure_geo || null
    },

    workers: {
      system: !!env?.SYSTEM,
      admin: !!env?.ADMIN,
      public: !!env?.PUBLIC,
      contractor: !!env?.CONTRACTOR,
      farmer: !!env?.FARMER,
      gov: !!env?.GOV,
      deepgov: !!env?.DEEPGOV
    },

    storage: {
      d1: !!env?.DB,
      kv: !!env?.KV,
      cache: !!env?.CACHE
    },

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

    decisionEngine: {
      endpoint: "/api/decision",
      status: "ready"
    },

    cortex: {
      endpoint: "/api/cortex",
      status: "ready"
    }
  };
}
