// seven-os/platform/enterprise-decision-engine.js
// GIA Sovereign Enterprise Governor – V12 Sovereign Edition
// 2050 Infrastructure OS – Platform Layer

// ─────────────────────────────────────────────────────────────
// Platform Configuration (Physical + Logical + Manifest)
// ─────────────────────────────────────────────────────────────

import nodeRegistry from "../config/node-registry.json";
import clusterHealth from "../config/cluster-health.json" assert { type: "json" };
import systemManifest from "../config/system-manifest.json" assert { type: "json" };

// ─────────────────────────────────────────────────────────────
// Enterprise Audit Engine
// ─────────────────────────────────────────────────────────────

import { sovereignAudit } from "./audit-engine.js";

// ─────────────────────────────────────────────────────────────
// Core Engines
// ─────────────────────────────────────────────────────────────

import { mathEngine } from "./engines/math-engine.js";
import { mappingEngine } from "./engines/math-mapping-engine.js";
import { logicEngine } from "./engines/logic-engine.js";
import { dataEngine } from "./engines/data-engine.js";

// ─────────────────────────────────────────────────────────────
// Sector Engines
// ─────────────────────────────────────────────────────────────

import { contractorEngine } from "./engines/sector-contractor-engine.js";
import { farmerEngine } from "./engines/sector-farmer-engine.js";
import { publicEngine } from "./engines/sector-public-engine.js";
import { govEngine } from "./engines/sector-gov-engine.js";
import { deepGovEngine } from "./engines/sector-deepgov-engine.js";
import { alfaEngine } from "./engines/sector-alfa-engine.js";

// ─────────────────────────────────────────────────────────────
// Optional Data + Schema Registry
// ─────────────────────────────────────────────────────────────

import { MockData } from "../data/mock-data.js";
import { getSectorSchema } from "./schema-registry.js";

function log(...args) {
  console.info("[ENTERPRISE-GOVERNOR]", ...args);
}

// ─────────────────────────────────────────────────────────────
// Platform Helpers
// ─────────────────────────────────────────────────────────────

function getPlatformId() {
  return systemManifest?.platform_id || "UNKNOWN-PLATFORM";
}

function getPlatformVersion() {
  return systemManifest?.version || "0.0.0";
}

function getFailsafeLevel() {
  return systemManifest?.failsafe_level || "STANDARD";
}

function getActiveSectors() {
  return systemManifest?.active_sectors || [];
}

function getDefaultEngine() {
  return "logic";
}

function getGovernorVersion() {
  return `v${getPlatformVersion()}`;
}

function getEnvironment() {
  return "global";
}

// ─────────────────────────────────────────────────────────────
// Node Resolution (Physical + Logical)
// ─────────────────────────────────────────────────────────────

function resolveNodeForSector(sector) {
  if (!sector) return null;
  const s = String(sector).toUpperCase();

  const physical = nodeRegistry?.clusters || [];
  const logical = clusterHealth?.clusters || [];

  let node =
    physical.find(c => String(c.sector || "").toUpperCase() === s) || null;

  if (!node) {
    const logicalMatch =
      logical.find(c => String(c.sector || "").toUpperCase() === s) || null;

    if (logicalMatch) {
      node = {
        name: logicalMatch.name,
        sector: logicalMatch.sector,
        logical: true,
        status: logicalMatch.status,
        health_score: logicalMatch.health_score
      };
    }
  }

  return node;
}

// ─────────────────────────────────────────────────────────────
// Trust Zone Resolution
// ─────────────────────────────────────────────────────────────

function resolveTrustZone(input) {
  if (input.trustZone) return input.trustZone;

  if (input.role) {
    switch (input.role) {
      case "public": return "PUBLIC";
      case "farmer": return "FARMER";
      case "contractor": return "CONTRACTOR";
      case "employee": return "EMPLOYEE";
      case "gov": return "GOV";
      case "deepgov": return "DEEPGOV";
      case "alfa": return "ALFA";
      default: return "PUBLIC";
    }
  }

  if (input.sector) {
    const s = String(input.sector).toUpperCase();
    if (s.includes("GOV")) return "GOV";
    if (s.includes("AGRI")) return "FARMER";
    if (s.includes("AI_LOGIC")) return "ALFA";
  }

  return "PUBLIC";
}

// ─────────────────────────────────────────────────────────────
// Engine Selection (Core + Sector)
// ─────────────────────────────────────────────────────────────

function selectCoreEngine(input) {
  const mode = input.mode || getDefaultEngine();
  switch (mode) {
    case "math": return mathEngine;
    case "mapping": return mappingEngine;
    case "data": return dataEngine;
    case "logic":
    default: return logicEngine;
  }
}

function selectSectorEngine(zone) {
  switch (zone) {
    case "FARMER": return farmerEngine;
    case "CONTRACTOR": return contractorEngine;
    case "GOV": return govEngine;
    case "DEEPGOV": return deepGovEngine;
    case "ALFA": return alfaEngine;
    case "PUBLIC":
    default: return publicEngine;
  }
}

// ─────────────────────────────────────────────────────────────
// Enterprise Audit Logging
// ─────────────────────────────────────────────────────────────

async function persistDecisionLog(input, output, zone, env, node) {
  try {
    const auditToken = await sovereignAudit.generateEntry(
      {
        platformId: getPlatformId(),
        platformVersion: getPlatformVersion(),
        sector: input.sector,
        nodeName: node?.name || null,
        decision: output,
        trustZone: zone,
        governorVersion: getGovernorVersion()
      },
      env
    );

    await env.GLOBAL_DB.prepare(
      "INSERT INTO system_audit (id, zone, payload) VALUES (?, ?, ?)"
    )
      .bind(auditToken.id, zone, auditToken.signedPayload)
      .run();

    return auditToken.id;
  } catch (err) {
    console.error("[AUDIT ERROR]", err);
    return `audit-failed-${Date.now()}`;
  }
}

// ─────────────────────────────────────────────────────────────
// Main Enterprise Governor Entry
// ─────────────────────────────────────────────────────────────

export async function runEnterpriseDecision(input = {}, env = {}) {
  const startedAt = Date.now();
  const trustZone = resolveTrustZone(input);
  const node = resolveNodeForSector(input.sector);

  const companyProfile = env.companyIdentity?.getProfile() || null;

  log("Incoming enterprise decision", {
    platformId: getPlatformId(),
    trustZone,
    sector: input.sector,
    nodeName: node?.name || null,
    mode: input.mode
  });

  try {
    const sectorSchema = await getSectorSchema(input.sector, trustZone, node);

    const coreEngine = selectCoreEngine(input);
    const sectorEngine = selectSectorEngine(trustZone);

    const context = {
      node,
      nodeRegistry,
      clusterHealth,
      systemManifest,
      env,
      trustZone,
      sector: input.sector,
      startedAt,
      mock: !input.live && !!MockData?.mockSectors,
      schema: sectorSchema,
      environment: getEnvironment(),
      governorVersion: getGovernorVersion(),
      platformId: getPlatformId(),
      platformVersion: getPlatformVersion(),
      failsafeLevel: getFailsafeLevel(),
      activeSectors: getActiveSectors(),
      endpoints: systemManifest?.endpoints || {}
    };

    const coreResult = await coreEngine(input, context);
    const result = await sectorEngine(input, coreResult, context);

    const logId = await persistDecisionLog(input, result, trustZone, env, node);

     const coreEngine = selectCoreEngine(input);
  const sectorEngine = selectSectorEngine(trustZone);

  const coreResult = await coreEngine(input, context);
  const result = await sectorEngine(input, coreResult, context);

  const logId = await persistDecisionLog(input, result, trustZone, env, node);

  return result;
}