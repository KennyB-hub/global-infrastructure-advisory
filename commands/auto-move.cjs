#!/usr/bin/env node
/**
 * Seven‑OS Unified Architecture Relocation Script - Extended Phase
 * 1. Restores the /backend/ architecture folder.
 * 2. Restores /db/, /edge-vault/, /frontend/, /geo-utilities/, /hubs/, and /hub_logic/ structures.
 * 3. Scans for any remaining files containing "seven-runtime" and moves them to /runtime/.
 */

const fs = require("fs");
const path = require("path");

let writeReport = (msg) => console.log(`[Report Logs] ${msg}`);
try {
    const utils = require("../utilities/write-report.cjs");
    if (typeof utils.writeReport === 'function') {
        writeReport = utils.writeReport;
    } else if (typeof utils === 'function') {
        writeReport = utils;
    }
} catch (e) {}

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, "runtime");

const MIGRATION_MATRIX = {
    // === MASTER LAYER 1: BACKEND MATRIX CORE ===
    "ai-routing.js": "backend/ai-routing.js",
    "backend\\agency-dispacher.js": "backend/agency-dispacher.js",
    "backend\\audit\\engine.js": "backend/audit/engine.js",
    "backend\\restore-root.js": "backend/restore-root.js",
    "backend\\routing-kernel.js": "backend/routing-kernel.js",
    "backend\\sharepoint-logger.js": "backend/sharepoint-logger.js",
    "backend\\sync-orchestrator.js": "backend/sync-orchestrator.js",
    "backend\\trust\\engine.js": "backend/trust/engine.js",
    "backend\\ewo\\ewo-router.js": "backend/ewo/ewo-router.js",
    "backend\\ewo\\ewo-schema.js": "backend/ewo/ewo-schema.js",
    "backend\\ewo\\sector-router.js": "backend/ewo/sector-router.js",
    "backend\\hub-logic\\farmer-routes.js": "backend/hub-logic/farmer-routes.js",
    "backend\\legal\\civil-apps\\evidence-vault\\compliance-check.js": "backend/legal/civil-apps/evidence-vault/compliance-check.js",
    "backend\\system\\health.js": "backend/system/health.js",
    "backend\\system\\uptime.js": "backend/system/uptime.js",
    "backend\\hubs\\admin\\admin-api.js": "backend/hubs/admin/admin-api.js",
    "backend\\hubs\\admin\\admin-dashboard.js": "backend/hubs/admin/admin-dashboard.js",
    "backend\\hubs\\admin\\admin-utils.js": "backend/hubs/admin/admin-utils.js",
    "backend\\hubs\\admin\\adminhub.ts": "backend/hubs/admin/adminhub.ts",
    "backend\\hubs\\admin\\dashboard.js": "backend/hubs/admin/dashboard.js",
    "backend\\hubs\\admin\\login.js": "backend/hubs/admin/login.js",
    "backend\\routes\\executive-routes.js": "backend/routes/executive-routes.js",
    "backend\\routes\\index.js": "backend/routes/index.js",
    "backend\\routes\\public-ai-map.js": "backend/routes/public-ai-map.js",
    "backend\\routes\\public-map.js": "backend/routes/public-map.js",
    "backend\\routes\\public-routes.js": "backend/routes/public-routes.js",
    "backend\\routes\\storage-routing vault-config.js": "backend/routes/storage-routing vault-config.js",
    "backend\\routes\\voice-flight.js": "backend/routes/voice-flight.js",
    "backend\\workers\\admin-protect-worker.js": "backend/workers/admin-protect-worker.js",
    "backend\\workers\\ai-worker\\ai-worker.js": "backend/workers/ai-worker/ai-worker.js",
    "backend\\workers\\ai-worker\\gia-deep-mind-2100.js": "backend/workers/ai-worker/gia-deep-mind-2100.js",
    "backend\\workers\\ai-worker\\index.js": "backend/workers/ai-worker/index.js",
    "backend\\workers\\api-worker.js": "backend/workers/api-worker.js",
    "backend\\workers\\contractor-workers\\deepgov-workers\\index.ts": "backend/workers/contractor-workers/deepgov-workers/index.ts",
    "backend\\workers\\contractor-workers\\index.ts": "backend/workers/contractor-workers/index.ts",
    "backend\\workers\\cyber\\cyber.soc-dashboard.ts": "backend/workers/cyber/cyber.soc-dashboard.ts",
    "backend\\workers\\debug-worker.js": "backend/workers/debug-worker.js",
    "backend\\workers\\discovery.ts": "backend/workers/discovery.ts",
    "backend\\workers\\emergency-router\\index.ts": "backend/workers/emergency-router/index.ts",
    "backend\\workers\\expansion\\index.ts": "backend/workers/expansion/index.ts",
    "backend\\workers\\field-enginegps-mapper.js": "backend/workers/field-enginegps-mapper.js",
    "backend\\workers\\gia-deep-mind-2100.js": "backend/workers/gia-deep-mind-2100.js",
    "backend\\workers\\intake.ts": "backend/workers/intake.ts",
    "backend\\workers\\organizer.js": "backend/workers/organizer.js",
    "backend\\workers\\system-workers\\admin-workers\\admin-endpoints.ts": "backend/workers/system-workers/admin-workers/admin-endpoints.ts",
    "backend\\workers\\system-workers\\admin-workers\\index.ts": "backend/workers/system-workers/admin-workers/index.ts",
    "backend\\workers\\system-workers\\emergency-router.js": "backend/workers/system-workers/emergency-router.js",
    "backend\\workers\\system-workers\\ewo-worker.ts": "backend/workers/system-workers/ewo-worker.ts",
    "backend\\workers\\system-workers\\heartbeat.js": "backend/workers/system-workers/heartbeat.js",
    "backend\\workers\\system-workers\\index.ts": "backend/workers/system-workers/index.ts",
    "backend\\workers\\system-workers\\protected-routes.js": "backend/workers/system-workers/protected-routes.js",
    "backend\\workers\\system-workers\\public-worker\\index.js": "backend/workers/system-workers/public-worker/index.js",
    "backend\\workers\\system-workers\\public-worker\\index.ts": "backend/workers/system-workers/public-worker/index.ts",
    "backend\\workers\\system-workers\\public-worker\\public-worker.js": "backend/workers/system-workers/public-worker/public-worker.js",
    "backend\\workers\\system-workers\\public-worker\\public-worker.ts": "backend/workers/system-workers/public-worker/public-worker.ts",
    "backend\\workers\\system-workers\\public-worker\\registry.js": "backend/workers/system-workers/public-worker/registry.js",
    "backend\\workers\\system-workers\\public-worker\\registry.ts": "backend/workers/system-workers/public-worker/registry.ts",
    "backend\\workers\\system-workers\\routing.js": "backend/workers/system-workers/routing.js",
    "backend\\workers\\system-workers\\worker-name\\registry.js": "backend/workers/system-workers/worker-name/registry.js",
    "backend\\workers\\system-workers\\worker-name\\registry.ts": "backend/workers/system-workers/worker-name/registry.ts",
    "backend\\workers\\Topology Sync Worker.js": "backend/workers/Topology Sync Worker.js",
    "backend\\workers\\worker-bridge.js": "backend/workers/worker-bridge.js",
    "backend\\workers\\worker-registry.ts": "backend/workers/worker-registry.ts",
    "backend\\workers\\worker.ts": "backend/workers/worker.ts",
    "backend\\workforce\\AI-workforce-sync-layer\\index.ts": "backend/workforce/AI-workforce-sync-layer/index.ts",
    "backend\\workforce\\contractor-check.js": "backend/workforce/contractor-check.js",
    "backend\\workforce\\contractor-matching.js": "backend/workforce/contractor-matching.js",
    "backend\\workforce\\contractor-workforce-engine.js": "backend/workforce/contractor-workforce-engine.js",
    "backend\\workforce\\workforce-matching.js": "backend/workforce/workforce-matching.js",

    // === MASTER LAYER 2: EXTENDED SOVEREIGN SUB-LOGIC CORES ===
    "db\\db-map.js": "db/db-map.js",
    "db\\db-service.js": "db/db-service.js",
    "ecosystem.config.js": "ecosystem.config.js",
    "edge-vault\\air-gap-sync.js": "edge-vault/air-gap-sync.js",
    "edge-vault\\VAULT-LAYER\\protected\\protectedmiddleware.js": "edge-vault/VAULT-LAYER/protected/protectedmiddleware.js",
    "edge-vault\\VAULT-LAYER\\protected\\require-admin.js": "edge-vault/VAULT-LAYER/protected/require-admin.js",
    "edge-vault\\VAULT-LAYER\\protected\\validate-token.js": "edge-vault/VAULT-LAYER/protected/validate-token.js",
    "edge-vault\\verify-token.js": "edge-vault/verify-token.js",
    "frontend\\hooks\\useDeepMind.js": "frontend/hooks/useDeepMind.js",
    "frontend\\map\\map-live.js": "frontend/map/map-live.js",
    "frontend\\map\\map-utils.js": "frontend/map/map-utils.js",
    "geo-utilities\\geoindex.js": "geo-utilities/geoindex.js",
    "hubs\\accounting\\dashboard.js": "hubs/accounting/dashboard.js",
    "hubs\\admin\\dashboard.js": "hubs/admin/dashboard.js",
    "hubs\\analytics\\dashboard.js": "hubs/analytics/dashboard.js",
    "hubs\\Ansys\\dashboard.js": "hubs/Ansys/dashboard.js",
    "hubs\\Contractor\\dashboard.js": "hubs/Contractor/dashboard.js",
    "hubs\\contractor-hub.js": "hubs/contractor-hub.js",
    "hubs\\Dashboard.js": "hubs/Dashboard.js",
    "hubs\\deepgov\\dashboard.js": "hubs/deepgov/dashboard.js",
    "hubs\\designer\\ai-blueprint-analyzer-starter.js": "hubs/designer/ai-blueprint-analyzer-starter.js",
    "hubs\\designer\\ai-site-layout-generator.js": "hubs/designer/ai-site-layout-generator.js",
    "hubs\\designer\\annotation.js": "hubs/designer/annotation.js",
    "hubs\\employee\\dashboard.js": "hubs/employee/dashboard.js",
    "hubs\\ExecutiveDashboard.js": "hubs/ExecutiveDashboard.js",
    "hubs\\farmer\\dashboard.js": "hubs/farmer/dashboard.js",
    "hubs\\global-map\\dashboard.js": "hubs/global-map/dashboard.js",
    "hubs\\gov\\dashboard.js": "hubs/gov/dashboard.js",
    "hubs\\hr\\dashboard.js": "hubs/hr/dashboard.js",
    "hubs\\infrastructure-hub.js": "hubs/infrastructure-hub.js",
    "hubs\\payroll\\dashboard.js": "hubs/payroll/dashboard.js",
    "hubs\\public\\dashboard.js": "hubs/public/dashboard.js",
    "hubs\\public-hub.js": "hubs/public-hub.js",
    "hubs\\PublicDashboard.js": "hubs/PublicDashboard.js",
    "hubs\\PublicHub.js": "hubs/PublicHub.js",
    "hubs\\shared\\api-client.js": "hubs/shared/api-client.js",
    "hubs\\shared\\nav-engine.js": "hubs/shared/nav-engine.js",
    "hubs\\shared\\role.js": "hubs/shared/role.js",
    "hubs\\shared\\sector-dashboard.js": "hubs/shared/sector-dashboard.js",
    "hubs\\Staff\\dashboard.js": "hubs/Staff/dashboard.js",
    "hubs\\Staff\\heatmap.js": "hubs/Staff/heatmap.js",
    "hubs\\supervisor\\dashboard.js": "hubs/supervisor/dashboard.js",
      "hubs\\system\\dashboard.js": "hubs/system/dashboard.js",
  "hub_logic\\accountant-ai.js": "hub_logic/accountant-ai.js",
  "hub_logic\\banker-ai.js": "hub_logic/banker-ai.js",
  "hub_logic\\jobs-engine.js": "hub_logic/jobs-engine.js",
  "hub_logic\\payroll-calc.js": "hub_logic/payroll-calc.js",
  "hub_logic\\payroll-run.js": "hub_logic/payroll-run.js",
  "hub_logic\\space.js": "hub_logic/space.js",
  "hub_logic\\staff-assign.js": "hub_logic/staff-assign.js",
  "hub_logic\\staff-monitor.js": "hub_logic/staff-monitor.js",
  "hub_logic\\staff-performance.js": "hub_logic/staff-performance.js",
  "hub_logic\\staff-shifts.js": "hub_logic/staff-shifts.js",
  "index.js": "index.js",
  "log\\log-api-endpoints.js": "log/log-api-endpoints.js"
};

const SUBFOLDERS = {
  ai: /ai|cortex|identity|logic-engine|schema-guard|workflows/i,
  context: /context/i,
  geo: /geo|mapping|normalize|region|lookup/i,
  infrastructure: /infrastructure|ingest|integrity|sensors|threat|scoring|matching/i,
  logs: /log-/i,
  policy: /policy/i,
  security: /auth|security|guard|key-engine/i,
  network: /routing-engine|network/i,
  rf: /rf/i,
  workforce: /workforce/i
};

// --- PHASE 1: RESTORATION MATRICES ---
function executeMatrixRestoration() {
  console.log("🚀 Phase 1: Initiating complete core & secondary asset relocation...");
  let movedCount = 0;

  for (const [flatName, destination] of Object.entries(MIGRATION_MATRIX)) {
    const pathsToTest = [
      path.join(ROOT, flatName),
      path.join(ROOT, "seven-os", flatName)
    ];

    let sourcePathFound = null;
    for (const testPath of pathsToTest) {
      if (fs.existsSync(testPath)) {
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
      console.log(`✔ [RESTORE MATCH] ${path.basename(sourcePathFound)} → ${destination}`);
      movedCount++;
    }
  }
  console.log(`✅ Phase 1 Complete. Relocated ${movedCount} elements.\n`);
}

// --- PHASE 2: AUTOMATED RUNTIME TELEMETRY SCANNER ---
function detectSubfolder(filename) {
  for (const [folder, pattern] of Object.entries(SUBFOLDERS)) {
    if (pattern.test(filename)) return folder;
  }
  return "";
}

function rewriteImports(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const updated = content.replace(/seven-runtime/g, "runtime");
  fs.writeFileSync(filePath, updated, "utf8");
}

function moveRuntimeFile(oldPath) {
  const filename = path.basename(oldPath);
  const subfolder = detectSubfolder(filename);
  const targetDir = path.join(RUNTIME, subfolder);
  const newPath = path.join(targetDir, filename);

  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
  fs.renameSync(oldPath, newPath);
  rewriteImports(newPath);
  console.log(`✔ [Runtime Scan Match] Moved: ${oldPath} → ${newPath}`);
}

function scan(dir) {
  const ignoredDirs = ["node_modules", ".git", "backend", "db", "edge-vault", "frontend", "geo-utilities", "hubs", "hub_logic"];
  if (ignoredDirs.some(folder => dir.includes(folder))) return;

  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scan(fullPath);
    } else {
      if (fullPath.includes("seven-runtime")) {
        moveRuntimeFile(fullPath);
      }
    }
  }
}

executeMatrixRestoration();

console.log("🔍 Phase 2: Scanning for remaining misplaced runtime files...");
scan(ROOT);
console.log("✅ Phase 2 Complete. All seven-runtime files moved into /runtime/.");

writeReport("Extended Layer Unflattening Operations Complete.");

