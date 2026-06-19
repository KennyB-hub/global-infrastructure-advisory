#!/usr/bin/env node
/**
 * Seven‑OS Unified Architecture & Runtime Relocation Script
 * 1. Restores the structured /backend/ folder from the flat seven-os directory.
 * 2. Scans for any remaining files containing "seven-runtime" and moves them to /runtime/.
 */

const fs = require("fs");
const path = require("path");

// Fix the writeReport lookup error safely
let writeReport = (msg) => console.log(`[Report Logs] ${msg}`);
try {
    const utils = require("../utilities/write-report.cjs");
    if (typeof utils.writeReport === 'function') {
        writeReport = utils.writeReport;
    } else if (typeof utils === 'function') {
        writeReport = utils;
    }
} catch (e) {
    // Falls back to console log silently without crashing
}

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, "runtime");

// Explicit mapping capturing the exact literal flattened string names sitting inside your seven-os folder
const BACKEND_MIGRATION_MATRIX = {
    // 1. Core Routing & Infrastructure Engine
    "ai-routing.js": "backend/ai-routing.js",
    "backend\\agency-dispacher.js": "backend/agency-dispacher.js",
    "backend\\audit\\engine.js": "backend/audit/engine.js",
    "backend\\restore-root.js": "backend/restore-root.js",
    "backend\\routing-kernel.js": "backend/routing-kernel.js",
    "backend\\sharepoint-logger.js": "backend/sharepoint-logger.js",
    "backend\\sync-orchestrator.js": "backend/sync-orchestrator.js",
    "backend\\trust\\engine.js": "backend/trust/engine.js",

    // 2. Layer & Sector Routers (EWO Grid)
    "backend\\ewo\\ewo-router.js": "backend/ewo/ewo-router.js",
    "backend\\ewo\\ewo-schema.js": "backend/ewo/ewo-schema.js",
    "backend\\ewo\\sector-router.js": "backend/ewo/sector-router.js",
    "backend\\hub-logic\\farmer-routes.js": "backend/hub-logic/farmer-routes.js",

    // 3. Governance, Legal & Civil Applications
    "backend\\legal\\civil-apps\\evidence-vault\\compliance-check.js": "backend/legal/civil-apps/evidence-vault/compliance-check.js",

    // 4. System & Operational Uptime Diagnostics
    "backend\\system\\health.js": "backend/system/health.js",
    "backend\\system\\uptime.js": "backend/system/uptime.js",

    // 5. Core API & Admin Dashboard Hubs
    "backend\\hubs\\admin\\admin-api.js": "backend/hubs/admin/admin-api.js",
    "backend\\hubs\\admin\\admin-dashboard.js": "backend/hubs/admin/admin-dashboard.js",
    "backend\\hubs\\admin\\admin-utils.js": "backend/hubs/admin/admin-utils.js",
    "backend\\hubs\\admin\\adminhub.ts": "backend/hubs/admin/adminhub.ts",
    "backend\\hubs\\admin\\dashboard.js": "backend/hubs/admin/dashboard.js",
    "backend\\hubs\\admin\\login.js": "backend/hubs/admin/login.js",

    // 6. Global Strategic Routes
    "backend\\routes\\executive-routes.js": "backend/routes/executive-routes.js",
    "backend\\routes\\index.js": "backend/routes/index.js",
    "backend\\routes\\public-ai-map.js": "backend/routes/public-ai-map.js",
    "backend\\routes\\public-map.js": "backend/routes/public-map.js",
    "backend\\routes\\public-routes.js": "backend/routes/public-routes.js",
    "backend\\routes\\storage-routing vault-config.js": "backend/routes/storage-routing vault-config.js",
    "backend\\routes\\voice-flight.js": "backend/routes/voice-flight.js",

    // 7. Core AI, System & Security Workers
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
    "backend\\workers\\Topology Sync Worker.js": "backend/workers/Topology Sync Worker.js",
    "backend\\workers\\worker-bridge.js": "backend/workers/worker-bridge.js",
    "backend\\workers\\worker-registry.ts": "backend/workers/worker-registry.ts",
    "backend\\workers\\worker.ts": "backend/workers/worker.ts",

    // 8. Subsystem & Edge Worker Nodes
    "backend\\workers\\system-workers\\admin-workers\\admin-endpoints.ts": "backend/workers/system-workers/admin-workers/admin-endpoints.ts",
    "backend\\workers\\system-workers\\admin-workers\\index.ts": "backend/workers/system-workers/admin-workers/index.ts",
    "backend\\workers\\system-workers\\emergency-router.js": "backend/workers/system-workers/emergency-router.js",
    "backend\\workers\\system-workers\\ewo-worker.ts": "backend/workers/system-workers/ewo-worker.ts",
    "backend\\workers\\system-workers\\heartbeat.js": "backend/workers/system-workers/heartbeat.js",
    "backend\\workers\\system-workers\\index.ts": "backend/workers/system-workers/index.ts",
    "backend\\workers\\system-workers\\protected-routes.js": "backend/workers/system-workers/protected-routes.js",
    "backend\\workers\\system-workers\\routing.js": "backend/workers/system-workers/routing.js",

    // 9. Public Worker Registry Stack
    "backend\\workers\\system-workers\\public-worker\\index.js": "backend/workers/system-workers/public-worker/index.js",
    "backend\\workers\\system-workers\\public-worker\\index.ts": "backend/workers/system-workers/public-worker/index.ts",
    "backend\\workers\\system-workers\\public-worker\\public-worker.js": "backend/workers/system-workers/public-worker/public-worker.js",
    "backend\\workers\\system-workers\\public-worker\\public-worker.ts": "backend/workers/system-workers/public-worker/public-worker.ts",
    "backend\\workers\\system-workers\\public-worker\\registry.js": "backend/workers/system-workers/public-worker/registry.js",
    "backend\\workers\\system-workers\\public-worker\\registry.ts": "backend/workers/system-workers/public-worker/registry.ts",
    "backend\\workers\\system-workers\\worker-name\\registry.js": "backend/workers/system-workers/worker-name/registry.js",
    "backend\\workers\\system-workers\\worker-name\\registry.ts": "backend/workers/system-workers/worker-name/registry.ts",

    // 10. Macroeconomic & Workforce Logic Matrix
    "backend\\workforce\\AI-workforce-sync-layer\\index.ts": "backend/workforce/AI-workforce-sync-layer/index.ts",
    "backend\\workforce\\contractor-check.js": "backend/workforce/contractor-check.js",
    "backend\\workforce\\contractor-matching.js": "backend/workforce/contractor-matching.js",
    "backend\\workforce\\contractor-workforce-engine.js": "backend/workforce/contractor-workforce-engine.js",
    "backend\\workforce\\workforce-matching.js": "backend/workforce/workforce-matching.js"
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

// --- PHASE 1: EXECUTE EXPLICIT CJS BACKEND ROUTING RESTORATION ---
function executeBackendRestoration() {
    console.log("🚀 Phase 1: Initiating explicit backend matrix relocation...");
    let movedCount = 0;

    for (const [flatName, targetRelativePath] of Object.entries(BACKEND_MIGRATION_MATRIX)) {
        const oldPath = path.join(ROOT, "seven-os", flatName);
        const newPath = path.join(ROOT, targetRelativePath);

        if (fs.existsSync(oldPath)) {
            const targetDir = path.dirname(newPath);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            fs.renameSync(oldPath, newPath);
            console.log(`✔ [CJS Move Match] ${flatName} → ${targetRelativePath}`);
            movedCount++;
        }
    }
    console.log(`✅ Phase 1 Complete. Relocated ${movedCount} core components back to /backend/.\n`);
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
