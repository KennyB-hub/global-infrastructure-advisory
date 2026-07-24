// ─────────────────────────────────────────────────────────────
// 2050 Decision Engine – Global Infrastructure Platform
// ─────────────────────────────────────────────────────────────

// Physical cluster map
import nodeRegistry from '../config/node-registry.json' assert { type: 'json' };

// Logical AI clusters + health (optional, from your second JSON)
import clusterHealth from '../config/cluster-health.json' assert { type: 'json' };

// Platform/system manifest (your last JSON)
import systemManifest from '../../config/system-manifest.json' assert { type: 'json' };

// Enterprise audit engine
import { sovereignAudit } from '../../ai/audit/audit-engine.js';

// Core engines
import { mathEngine } from './engines/math-engine.js';
import { mappingEngine } from './engines/math-mapping-engine.js'; // or mapping-engine.js
import { logicEngine } from '../general/logic-engine.js';
import { dataEngine } from './data-engine.js';

// Sector / hub engines
import { contractorEngine } from './engines/sector-contractor-engine.js';
import { farmerEngine } from './engines/sector-farmer-engine.js';
import { publicEngine } from './engines/sector-public-engine.js';
import { govEngine } from './engines/sector-gov-engine.js';
import { deepGovEngine } from './engines/sector-deepgov-engine.js';
import { alfaEngine } from './engines/sector-alfa-engine.js';
import { runEnterpriseDecision } from "../../platform/enterprise-decision-engine.js";

// Optional mock data
import { MockData } from '../../data/mock-data.js';

// Optional schema registry
import { getSectorSchema } from '../../data/schemas/schema-registry.js';

function log(...args) {
  console.info('[DECISION-ENGINE]', ...args);
}

// ─────────────────────────────────────────────────────────────
// Config helpers – unify registry + health + manifest
// ─────────────────────────────────────────────────────────────

function getPlatformId() {
  return systemManifest?.platform_id || 'UNKNOWN-PLATFORM';
}

function getPlatformVersion() {
  return systemManifest?.version || '0.0.0';
}

function getFailsafeLevel() {
  return systemManifest?.failsafe_level || 'STANDARD';
}

function getActiveSectors() {
  return systemManifest?.active_sectors || [];
}

function getDefaultEngine() {
  // You can later move this into manifest; for now, logic is the spine
  return 'logic';
}

function getGovernorVersion() {
  // Tie governor to platform version for now
  return `v${getPlatformVersion()}`;
}

function getEnvironment() {
  // Could be extended to read from env vars or another config
  return 'global';
}

function resolveNodeForSector(sector) {
  if (!sector) return null;
  const s = String(sector).toUpperCase();

  const physical = nodeRegistry?.clusters || [];
  const logical = clusterHealth?.clusters || [];

  // 1) Exact sector match on physical clusters
  let node =
    physical.find(c => String(c.sector || '').toUpperCase() === s) || null;

  // 2) Fallback: logical clusters by sector
  if (!node) {
    const logicalMatch =
      logical.find(c => String(c.sector || '').toUpperCase() === s) || null;
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
// Trust zone resolution
// ─────────────────────────────────────────────────────────────

function resolveTrustZone(input) {
  if (input.trustZone) return input.trustZone;

  if (input.role) {
    switch (input.role) {
      case 'public':
        return 'PUBLIC';
      case 'farmer':
        return 'FARMER';
      case 'contractor':
        return 'CONTRACTOR';
      case 'employee':
        return 'EMPLOYEE';
      case 'gov':
        return 'GOV';
      case 'deepgov':
        return 'DEEPGOV';
      case 'alfa':
        return 'ALFA';
      default:
        return 'PUBLIC';
    }
  }

  if (input.sector) {
    const s = String(input.sector).toUpperCase();
    if (s.includes('GOV')) return 'GOV';          // GOV_NATO
    if (s.includes('AGRI')) return 'FARMER';      // AGRI_INFRA
    if (s.includes('AI_LOGIC')) return 'ALFA';    // DEEP-MIND-CORE
  }

  return 'PUBLIC';
}

// ─────────────────────────────────────────────────────────────
// Engine selection (core + sector)
// ─────────────────────────────────────────────────────────────

function selectCoreEngine(input) {
  const mode = input.mode || getDefaultEngine();

  switch (mode) {
    case 'math':
      return mathEngine;
    case 'mapping':
      return mappingEngine;
    case 'data':
      return dataEngine;
    case 'logic':
    default:
      return logicEngine;
  }
}

function selectSectorEngine(trustZone) {
  switch (trustZone) {
    case 'FARMER':
      return farmerEngine;
    case 'CONTRACTOR':
      return contractorEngine;
    case 'GOV':
      return govEngine;
    case 'DEEPGOV':
      return deepGovEngine;
    case 'ALFA':
      return alfaEngine;
    case 'PUBLIC':
    default:
      return publicEngine;
  }
}

// ─────────────────────────────────────────────────────────────
// Validation / schema guard
// ─────────────────────────────────────────────────────────────

function validateAgainstSchema(input, sectorSchema) {
  if (!sectorSchema) return { valid: true, errors: [] };
  // Plug in your real validator here
  return { valid: true, errors: [] };
}

// ─────────────────────────────────────────────────────────────
// Unified Enterprise Logging Layer
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
      'INSERT INTO system_audit (id, zone, payload) VALUES (?, ?, ?)'
    )
      .bind(auditToken.id, zone, auditToken.signedPayload)
      .run();

    console.info(
      `[AUDIT] Logged decision ${auditToken.id} for zone ${zone} node ${node?.name || 'n/a'}`
    );
    return auditToken.id;
  } catch (err) {
    console.error('[AUDIT ERROR]', err);
    return `audit-failed-${Date.now()}`;
  }
}

// ─────────────────────────────────────────────────────────────
// Main Decision Engine Entry
// ─────────────────────────────────────────────────────────────

export async function runDecision(input = {}, env = {}) {
  const startedAt = Date.now();
  const trustZone = resolveTrustZone(input);
  const node = resolveNodeForSector(input.sector);

  log('Incoming decision request', {
    platformId: getPlatformId(),
    trustZone,
    sector: input.sector,
    nodeName: node?.name || null,
    mode: input.mode
  });

  try {
    const sectorSchema = await getSectorSchema(input.sector, trustZone, node);

    const validation = validateAgainstSchema(input, sectorSchema);
    if (!validation.valid) {
      return {
        success: false,
        error: 'Validation failed',
        trustZone,
        nodeName: node?.name || null,
        errors: validation.errors
      };
    }

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

    log('Decision engine completed successfully.');

    return {
      success: true,
      timestamp: new Date().toISOString(),
      platformId: getPlatformId(),
      platformVersion: getPlatformVersion(),
      engine: input.mode || getDefaultEngine(),
      trustZone,
      nodeName: node?.name || null,
      durationMs: Date.now() - startedAt,
      data: result,
      metadata: {
        sectorVerified: !!sectorSchema,
        environment: getEnvironment(),
        isMock: !input.live && !!MockData?.mockSectors,
        failsafeLevel: getFailsafeLevel(),
        activeSectors: getActiveSectors(),
        endpoints: systemManifest?.endpoints || {}
      },
      logId
    };
  } catch (globalErr) {
    console.error('[ENGINE FAILURE]', globalErr);

    return {
      success: false,
      error: 'Critical engine failure',
      details: globalErr.message,
      platformId: getPlatformId(),
      platformVersion: getPlatformVersion(),
      trustZone,
      nodeName: node?.name || null,
      durationMs: Date.now() - startedAt
    };
  }
}
