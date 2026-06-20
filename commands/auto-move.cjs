#!/usr/bin/env node
/**
 * Seven‑OS Autonomic Master Recovery & Expansion Engine
 * Rebuilds the entire 10-layer folder architecture from the flat workspace.
 * Follows every single route map key to ensure full structural clarity.
 */

const fs = require("fs");
const path = require("path");

let writeReport = (msg) => console.log(`[Report Logs] ${msg}`);
try {
  const utils = require("../utilities/write-report.cjs");
  if (typeof utils.writeReport === 'function') writeReport = utils.writeReport;
} catch (e) {}

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, "runtime");

// MASTER DIRECTORY DICTIONARY: Maps every root working key to its absolute folder name
const MASTER_MIGRATION_MATRIX = {
  // === 1. Core Routing & Infrastructure Engine ===
  "ai-routing.js": "backend/ai-routing.js",
  "agency-dispacher.js": "backend/agency-dispacher.js",
  "engine.js": "backend/audit/engine.js",
  "restore-root.js": "backend/restore-root.js",
  "routing-kernel.js": "backend/routing-kernel.js",
  "sharepoint-logger.js": "backend/sharepoint-logger.js",
  "sync-orchestrator.js": "backend/sync-orchestrator.js",
  "trust-engine.js": "backend/trust/engine.js",
  "health.js": "backend/system/health.js",
  "uptime.js": "backend/system/uptime.js",

  // === 2. Layer & Sector Routers (EWO Grid) ===
  "ewo-router.js": "backend/ewo/ewo-router.js",
  "ewo-schema.js": "backend/ewo/ewo-schema.js",
  "sector-router.js": "backend/ewo/sector-router.js",
  "farmer-routes.js": "backend/hub-logic/farmer-routes.js",

  // === 3. Governance, Legal & Civil Applications ===
  "compliance-check.js": "backend/legal/civil-apps/evidence-vault/compliance-check.js",

  // === 4. Core API & Admin Dashboard Hubs ===
  "admin-api.js": "backend/hubs/admin/admin-api.js",
  "admin-dashboard.js": "backend/hubs/admin/admin-dashboard.js",
  "admin-utils.js": "backend/hubs/admin/admin-utils.js",
  "adminhub.ts": "backend/hubs/admin/adminhub.ts",
  "dashboard.js": "backend/hubs/admin/dashboard.js",
  "login.js": "backend/hubs/admin/login.js",

  // === 5. Global Strategic Routes & Root Index ===
  "executive-routes.js": "backend/routes/executive-routes.js",
  "index.js": "backend/routes/index.js",
  "public-ai-map.js": "backend/routes/public-ai-map.js",
  "public-map.js": "backend/routes/public-map.js",
  "public-routes.js": "backend/routes/public-routes.js",
  "storage-routing vault-config.js": "backend/routes/storage-routing vault-config.js",
  "voice-flight.js": "backend/routes/voice-flight.js",

  // === 6. Core AI, System & Security Workers ===
  "admin-protect-worker.js": "backend/workers/admin-protect-worker.js",
  "ai-worker.js": "backend/workers/ai-worker/ai-worker.js",
  "gia-deep-mind-2100.js": "backend/workers/ai-worker/gia-deep-mind-2100.js",
  "api-worker.js": "backend/workers/api-worker.js",
  "cyber.soc-dashboard.ts": "backend/workers/cyber/cyber.soc-dashboard.ts",
  "debug-worker.js": "backend/workers/debug-worker.js",
  "discovery.ts": "backend/workers/discovery.ts",
  "field-enginegps-mapper.js": "backend/workers/field-enginegps-mapper.js",
  "intake.ts": "backend/workers/intake.ts",
  "organizer.js": "backend/workers/organizer.js",
  "Topology Sync Worker.js": "backend/workers/Topology Sync Worker.js",
  "worker-bridge.js": "backend/workers/worker-bridge.js",
  "worker-registry.ts": "backend/workers/worker-registry.ts",
  "worker.ts": "backend/workers/worker.ts",

  // === 7. Subsystem & Edge Worker Nodes ===
  "admin-endpoints.ts": "backend/workers/system-workers/admin-workers/admin-endpoints.ts",
  "emergency-router.js": "backend/workers/system-workers/emergency-router.js",
  "ewo-worker.ts": "backend/workers/system-workers/ewo-worker.ts",
  "heartbeat.js": "backend/workers/system-workers/heartbeat.js",
  "protected-routes.js": "backend/workers/system-workers/protected-routes.js",
  "routing.js": "backend/workers/system-workers/routing.js",

  // === 8. Public Worker Registry Stack ===
  "public-worker.js": "backend/workers/system-workers/public-worker/public-worker.js",
  "public-worker.ts": "backend/workers/system-workers/public-worker/public-worker.ts",

  // === 9. Macroeconomic & Workforce Logic Matrix ===
  "contractor-check.js": "backend/workforce/contractor-check.js",
  "contractor-matching.js": "backend/workforce/contractor-matching.js",
  "contractor-workforce-engine.js": "backend/workforce/contractor-workforce-engine.js",
  "workforce-matching.js": "backend/workforce/workforce-matching.js",

  // === 10. UNIVERSAL UI DASHBOARDS ===
  "accounting-dashboard.js": "hubs/accounting/dashboard.js",
  "analytics-dashboard.js": "hubs/analytics/dashboard.js",
  "ansys-dashboard.js": "hubs/Ansys/dashboard.js",
  "contractor-dashboard.js": "hubs/Contractor/dashboard.js",
  "contractor-hub.js": "hubs/contractor-hub.js",
  "UniversalDashboard.js": "hubs/Dashboard.js",
  "deepgov-dashboard.js": "hubs/deepgov/dashboard.js",
  "ai-blueprint-analyzer.js": "hubs/designer/ai-blueprint-analyzer-starter.js",
  "ai-site-layout.js": "hubs/designer/ai-site-layout-generator.js",
  "annotation.js": "hubs/designer/annotation.js",
  "employee-dashboard.js": "hubs/employee/dashboard.js",
  "ExecutiveDashboard.js": "hubs/ExecutiveDashboard.js",
  "farmer-dashboard.js": "hubs/farmer/dashboard.js",
  "global-map-dashboard.js": "hubs/global-map/dashboard.js",
  "gov-dashboard.js": "hubs/gov/dashboard.js",
  "hr-dashboard.js": "hubs/hr/dashboard.js",
  "infrastructure-hub.js": "hubs/infrastructure-hub.js",
  "payroll-dashboard.js": "hubs/payroll/dashboard.js",
  "public-dashboard.js": "hubs/public/dashboard.js",
  "public-hub.js": "hubs/public-hub.js",
  "PublicDashboard.js": "hubs/PublicDashboard.js",
  "api-client.js": "hubs/shared/api-client.js",
  "nav-engine.js": "hubs/shared/nav-engine.js",
  "role.js": "hubs/shared/role.js",
  "sector-dashboard.js": "hubs/shared/sector-dashboard.js",
  "staff-dashboard.js": "hubs/Staff/dashboard.js",
  "heatmap.js": "hubs/Staff/heatmap.js",
  "supervisor-dashboard.js": "hubs/supervisor/dashboard.js",
  "system-dashboard.js": "hubs/system/dashboard.js",

  // === 11. UNIVERSAL CONTRACT PAYMENT BUCKETS & RUNTIMES ===
  "payment-bucket.js": "backend/routes/payment-bucket.js",
  "ledger-guard.js": "backend/system/ledger-guard.js",
  "accountant-ai.js": "hub_logic/accountant-ai.js",
  "banker-ai.js": "hub_logic/banker-ai.js",
  "jobs-engine.js": "hub_logic/jobs-engine.js",
  "payroll-calc.js": "hub_logic/payroll-calc.js",
  "payroll-run.js": "hub_logic/payroll-run.js",
  "space.js": "hub_logic/space.js",
  "staff-assign.js": "hub_logic/staff-assign.js",
  "staff-monitor.js": "hub_logic/staff-monitor.js",
  "staff-performance.js": "hub_logic/staff-performance.js",
  "staff-shifts.js": "hub_logic/staff-shifts.js",
  "log-api-endpoints.js": "log/log-api-endpoints.js",
  "db-map.js": "db/db-map.js",
  "db-service.js": "db/db-service.js",
  "ecosystem.config.js": "ecosystem.config.js",
  "air-gap-sync.js": "edge-vault/air-gap-sync.js",
  "protectedmiddleware.js": "edge-vault/VAULT-LAYER/protected/protectedmiddleware.js",
  "require-admin.js": "edge-vault/VAULT-LAYER/protected/require-admin.js",
  "validate-token.js": "edge-vault/VAULT-LAYER/protected/validate-token.js",
  "verify-token.js": "edge-vault/verify-token.js",
  "useDeepMind.js": "frontend/hooks/useDeepMind.js",
  "map-live.js": "frontend/map/map-live.js",
  "map-utils.js": "frontend/map/map-utils.js",
  "geoindex.js": "geo-utilities/geoindex.js"
};

function executeMasterRestoration() {
  console.log("🚀 Initializing Master Recovery: Organizing Seven-OS folder layout...");
  let movedCount = 0;

  for (const [flatName, destination] of Object.entries(MASTER_MIGRATION_MATRIX)) {
    const pathsToTest = [
      path.join(ROOT, flatName),
      path.join(ROOT, "seven-os", flatName),
      path.join(ROOT, flatName.replace(/\\/g, "/")),
      path.join(ROOT, "seven-os", flatName.replace(/\\/g, "/")),
      path.join(ROOT, path.basename(destination))
    ];

    let sourcePathFound = null;
    for (const testPath of pathsToTest) {
      if (fs.existsSync(testPath) && !fs.statSync(testPath).isDirectory()) {
        sourcePathFound = testPath;
        break;
      }
    }

    if (sourcePathFound) {
      const destinationPath = path.join(ROOT, destination);
      const destinationDir = path.dirname(destinationPath);

      if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir, { recursive: true });
      }

      fs.renameSync(sourcePathFound, destinationPath);
      console.log(`✔ [RECOVERED] ${path.basename(sourcePathFound)} → ${destination}`);
      movedCount++;
    }
  }
  console.log(`✅ Architecture Synced. Successfully mapped ${movedCount} elements into clean folders.\n`);
}

executeMasterRestoration();
writeReport("Root Architecture Alignment and Key-Mapping Cycle Complete.");
