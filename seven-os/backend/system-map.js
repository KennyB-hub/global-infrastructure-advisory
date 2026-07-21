// /workers/system/system-map.js
// GIA Sovereign System Map Engine – V12 Alpha

import systemManifest from "../config/system-manifest.json" assert { type: "json" };
import nodeRegistry from "../../config/node-registry.json" assert { type: "json" };
import clusterHealth from "../../config/cluster-health.json" assert { type: "json" };
import { getTrustZones } from "seven-os/backend/system/trust.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "GIA-Platform-ID": systemManifest.platform_id,
      "GIA-Version": systemManifest.version
    }
  });
}

export async function onRequest(context) {
  //
  // 1. TRUST ZONES
  //
  const trustZones = getTrustZones();

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
  // 5. ORGANS (SYSTEM TOPOLOGY)
  //
  const organs = {
    infrastructure: {
      root: "seven-os/backend/infrastructure/",
      core: [
        "bootstrap.yaml",
        "diagnostics.js",
        "routing-inspector.js",
        "ssh-manager.js"
      ],
      tools: [
        "tools/r2-uploader.js",
        "tools/r2-check.js",
        "tools/r2-inspector.js",
        "tools/r2-bucket-list.js",
        "tools/r2-exposure.js",
        "tools/r2-health.js",
        "tools/storage-inspector.js"
      ],
      utils: [
        "utils/safe-shell.js",
        "utils/infra-logger.js",
        "utils/normalize-path.js",
        "utils/parse-endpoint.js"
      ]
    },

    security: {
      root: "seven-os/backend/security/",
      tools: [
        "tools/inspect-routing.js",
        "tools/threat-scan.js"
      ]
    },

    systemWorkers: {
      root: "seven-os/backend/workers/system/",
      endpoints: [
        "system-status.js",
        "diagnostics.js",
        "system-infrastructure.js",
        "system-routing.js",
        "system-storage.js",
        "system-health.js",
        "system-full-report.js",
        "threat-report.js",
        "system-endpoints.js",
        "system-security.js",
        "system-ai.js",
        "system-map.js",
        "system-trust.js",
        "system-uptime.js",
        "index.js"
      ]
    }
  };

  //
  // 6. AI SUBSYSTEM
  //
  const ai = {
    decisionEngine: "/api/decision",
    cortex: "/api/cortex",
    deepMind: "/api/deep-mind",
    engineAvailable: typeof context.env?.AI?.run === "function",
    status: typeof context.env?.AI?.run === "function" ? "ready" : "offline"
  };

  //
  // 7. FINAL SOVEREIGN SYSTEM MAP
  //
  const map = {
    timestamp: new Date().toISOString(),
    platform,
    trustZones,
    nodes,
    clusters,
    organs,
    ai,
    notes:
      "This is the Sovereign System Map. All routing, trust, AI execution, and system operations must comply with this topology."
  };

  return json({
    system: "map",
    status: "ok",
    map
  });
}
