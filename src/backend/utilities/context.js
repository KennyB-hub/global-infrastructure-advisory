// src/backend/utils/context.js
// Shared sovereign context + integrity helpers – V12 Alpha

import systemManifest from "../../config/system-manifest.json" assert { type: "json" };
import nodeRegistry from "../../config/node-registry.json" assert { type: "json" };
import clusterHealth from "../../config/cluster-health.json" assert { type: "json" };

export function getPlatformContext() {
  return {
    id: systemManifest.platform_id,
    version: systemManifest.version,
    failsafe: systemManifest.failsafe_level,
    active_sectors: systemManifest.active_sectors,
    endpoints: systemManifest.endpoints
  };
}

export function getNodeContext() {
  return nodeRegistry.clusters.map(c => ({
    name: c.name,
    sector: c.sector,
    hostname: c.hostname,
    port: c.port,
    tls: c.tls
  }));
}

export function getClusterContext() {
  return clusterHealth.clusters.map(c => ({
    name: c.name,
    sector: c.sector,
    status: c.status,
    health_score: c.health_score
  }));
}

export function getAIContext(env) {
  const ai = env?.AI || env?.ai;
  return {
    decisionEngine: "/api/decision",
    cortex: "/api/cortex",
    deepMind: "/api/deep-mind",
    engineAvailable: typeof ai?.run === "function",
    status: typeof ai?.run === "function" ? "ready" : "offline"
  };
}

export async function sha256(input) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function makeOk(result, env, extra = {}) {
  return {
    ok: true,
    timestamp: new Date().toISOString(),
    platform: getPlatformContext(),
    nodes: getNodeContext(),
    clusters: getClusterContext(),
    ai: getAIContext(env),
    result,
    integrity: {
      hash: await sha256(JSON.stringify(result)),
      ...extra
    }
  };
}

export async function makeError(error, env, details = {}) {
  const payload = { error, details };
  return {
    ok: false,
    timestamp: new Date().toISOString(),
    platform: getPlatformContext(),
    nodes: getNodeContext(),
    clusters: getClusterContext(),
    ai: getAIContext(env),
    ...payload,
    integrity: {
      hash: await sha256(JSON.stringify(payload))
    }
  };
}
