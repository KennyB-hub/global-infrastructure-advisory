// src/system/system-endpoints.js
// GIA Sovereign System Status – V12 Alpha

import systemManifest from "../config/system-manifest.json" assert { type: "json" };
import nodeRegistry from "../config/node-registry.json" assert { type: "json" };
import clusterHealth from "../config/cluster-health.json" assert { type: "json" };

export function systemStatus(manifest = {}) {
  return {
    system: "GIA System Node",
    status: "online",
    timestamp: new Date().toISOString(),

    platform: {
      id: systemManifest.platform_id,
      version: systemManifest.version,
      failsafe: systemManifest.failsafe_level,
      active_sectors: systemManifest.active_sectors,
      endpoints: systemManifest.endpoints
    },

    manifest: {
      engine: manifest.engine || "GIA Deep Mind 2100",
      version: manifest.version || "1.0",
      environment: manifest.environment || "global"
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

    ai: {
      decisionEngine: "/api/decision",
      cortex: "/api/cortex",
      deepMind: "/api/deep-mind",
      status: "ready"
    },

    notes: "System status reflects the Sovereign AI runtime state. All system operations must comply with trust‑zone and platform policy."
  };
}
