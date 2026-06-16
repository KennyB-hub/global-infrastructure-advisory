#!/usr/bin/env node
// Seven‑OS Autosorter Stage 2 (v3/v12 - Hardened ESM Self-Reporting Edition)
// Cleans seven-os by moving misplaced files INTO correct OS layers with live reports.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.cwd();

const reportLog = {
  timestamp: new Date().toISOString(),
  engine: "Seven‑OS Autosorter Stage 2 (v3/v12)",
  operations: [],
  status: "INITIALIZED"
};

/**
 * Robust file and folder migration tool with active tracking records
 */
function move(from, to) {
  const src = path.join(ROOT, from);
  const dest = path.join(ROOT, to);

  if (!fs.existsSync(src)) {
    return; // Already sorted by previous execution sweeps
  }

  if (src === dest) return;

  try {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    
    // If it's a directory containing files, move individual files recursively to prevent crashes
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      const files = fs.readdirSync(src);
      files.forEach(file => {
        const innerSrc = path.join(from, file);
        const innerDest = path.join(to, file);
        move(innerSrc, innerDest);
      });
      // Safely delete empty source directories once internal files have been migrated
      try { fs.rmdirSync(src); } catch (e) {}
    } else {
      fs.renameSync(src, dest);
      const logLine = `↪ Realigned: ${from} ➔ ${to}`;
      console.log(logLine);
      reportLog.operations.push({ from, to, status: "SUCCESS" });
    }
  } catch (err) {
    console.error(`❌ Move failed for ${from}:`, err.message);
    reportLog.operations.push({ from, to, status: "FAILED", error: err.message });
  }
}

async function runStage2() {
  console.log("==================================================");
  console.log("📦   SEVEN-OS AUTOSORTER STAGE 2 (V12 PRO)        ");
  console.log("==================================================");
  console.log(`Active Workspace Root: ${ROOT}\n`);

  // 1. Move OS-core engines into seven-os/system
  const osCoreEngines = [ "seven-os/threat", "seven-os/analysis", "seven-os/logs", "seven-os/infra", "seven-os/sensors" ];
  osCoreEngines.forEach(item => {
    move(item, `seven-os/system/${path.basename(item)}`);
  });

  // 2. Move API engines into seven-os/api
  const apiEngines = [ 
    "seven-os/api/opportunity.js", "seven-os/api/opportunities-active.js", 
    "seven-os/api/marketplace.js", "seven-os/api/program-matching-dashboard.js", 
    "seven-os/api/contractors.js", "seven-os/api/donors.js" 
  ];
  apiEngines.forEach(item => {
    move(item, `seven-os/api/${path.basename(item)}`);
  });

  // 3. Move workers into seven-os/workers
  const workers = [ "seven-os/workers/debug", "seven-os/workers/finance", "seven-os/workers/project-search-worker.js", "seven-os/workers/log-ingestion-worker.js" ];
  workers.forEach(item => {
    move(item, `seven-os/workers/${path.basename(item)}`);
  });

  // 4. Move dashboards into seven-os/system/ui
  const dashboards = [ "seven-os/api/map", "seven-os/api/command-dashboard.ts", "seven-os/logs/log-ui-dashboard.js", "seven-os/cattle/dashboard.ts" ];
  dashboards.forEach(item => {
    move(item, `seven-os/system/ui/${path.basename(item)}`);
  });

  // 5. Move map engines into seven-os/system/map
  const maps = [ "seven-os/api/map/map.html", "seven-os/api/map/map.js" ];
  maps.forEach(item => {
    move(item, `seven-os/system/map/${path.basename(item)}`);
  });

  // Finalize operations and compile the live report
  reportLog.status = "COMPLETE";
  reportLog.totalMoved = reportLog.operations.length;

  const targetReportFolder = path.join(ROOT, "seven-os", "system");
  if (!fs.existsSync(targetReportFolder)) {
    fs.mkdirSync(targetReportFolder, { recursive: true });
  }

  fs.writeFileSync(
    path.join(targetReportFolder, "api-routing-map.json"),
    JSON.stringify(reportLog, null, 2)
  );

  console.log("\n==================================================");
  console.log("✅ SEVEN-OS AUTOSORTER STAGE 2 SYNC METRICS REPORT COMPLETED");
  console.log(`   Total System Components Re-Aligned: ${reportLog.totalMoved}`);
  console.log("   Report Matrix Exported to: seven-os/system/api-routing-map.json");
  console.log("==================================================");
}

runStage2().catch(console.error);
