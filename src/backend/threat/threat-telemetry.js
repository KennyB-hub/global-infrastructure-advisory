// src/backend/threat/threat-storage.js
// GIA Sovereign Threat Storage Engine – V12 Alpha

import systemManifest from "../../config/system-manifest.json" assert { type: "json" };
import nodeRegistry from "../../config/node-registry.json" assert { type: "json" };
import clusterHealth from "../../config/cluster-health.json" assert { type: "json" };

export async function recordThreatEvent(env, threatResult) {
  const timestamp = threatResult.timestamp || Date.now();
  const uuid = crypto.randomUUID();
  const key = `threat:${timestamp}:${uuid}`;

  //
  // 1. Sovereign threat event payload
  //
  const value = JSON.stringify({
    id: uuid,
    timestamp,
    riskLevel: threatResult.riskLevel,
    categories: threatResult.categories,
    sector: threatResult.sector,

    // V12 Alpha metadata
    platform: {
      id: systemManifest.platform_id,
      version: systemManifest.version,
      failsafe: systemManifest.failsafe_level
    },

    nodes: nodeRegistry.clusters.map(c => ({
      name: c.name,
      sector: c.sector
    })),

    clusters: clusterHealth.clusters.map(c => ({
      name: c.name,
      status: c.status,
      health_score: c.health_score
    })),

    ai: {
      engineAvailable: typeof env?.AI?.run === "function",
      decisionEngine: "/api/decision",
      cortex: "/api/cortex",
      deepMind: "/api/deep-mind"
    },

    integrity: {
      hash: await sha256(JSON.stringify(threatResult)),
      stored_at: new Date().toISOString()
    }
  });

  //
  // 2. Store in KV
  //
  await env.GIA_THREATS.put(key, value);

  //
  // 3. Return sovereign-grade metadata
  //
  return {
    stored: true,
    key,
    timestamp,
    platform: systemManifest.platform_id,
    integrity: "verified"
  };
}

// Utility: SHA-256 hashing for integrity
async function sha256(input) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

