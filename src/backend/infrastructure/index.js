// src/backend/infrastructure/index.js
// GIA Sovereign Infrastructure Organ – V12 Alpha

import * as tools from "./tools/index.js";
import * as utils from "./utils/index.js";

import diagnostics from "./diagnostics.js";
import routingInspector from "./routing-inspector.js";
import sshManager from "./ssh-manager.js";

import systemManifest from "../../config/system-manifest.json" assert { type: "json" };
import nodeRegistry from "../../config/node-registry.json" assert { type: "json" };
import clusterHealth from "../../config/cluster-health.json" assert { type: "json" };

export default {
  //
  // ORGAN METADATA (NEW — V12 Alpha)
  //
  meta: {
    organ: "infrastructure",
    version: "V12-Alpha",
    description: "Handles infrastructure diagnostics, routing inspection, SSH operations, and system-level tooling.",
    safeSurfaces: [
      "/system/infrastructure",
      "/system/storage",
      "/system/routing",
      "/system/status"
    ],
    guardedSurfaces: [
      "/admin/*",
      "/api/decision",
      "/api/cortex",
      "/ewo/*"
    ],
    notes: "Infrastructure organ must treat all write-capable or network-modifying operations as guarded surfaces requiring sovereign policy."
  },

  //
  // PLATFORM + NODE + CLUSTER CONTEXT (NEW)
  //
  platform: {
    id: systemManifest.platform_id,
    version: systemManifest.version,
    failsafe: systemManifest.failsafe_level,
    active_sectors: systemManifest.active_sectors
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

  //
  // ORGAN CAPABILITIES (UPGRADED)
  //
  diagnostics,
  routingInspector,
  sshManager,
  tools,
  utils
};
