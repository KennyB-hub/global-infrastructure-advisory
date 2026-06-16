#!/usr/bin/env node
// Seven‑OS Autosorter Stage 3 (v3/v12 - Hardened Hybrid Wrapper)
// Drains legacy backend/src folders into Seven‑OS and utilities with dual-syntax protection.

const fs = require("fs");
const path = require("path");
const ROOT = process.cwd();

const stage3Report = {
  timestamp: new Date().toISOString(),
  engine: "Seven‑OS Autosorter Stage 3 (v3/v12)",
  operations: [],
  status: "INITIALIZED"
};

/**
 * Robust recursive migration engine to prevent Windows file-lock exceptions
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
    
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      const files = fs.readdirSync(src);
      files.forEach(file => {
        const innerSrc = path.join(from, file);
        const innerDest = path.join(to, file);
        move(innerSrc, innerDest);
      });
      try { fs.rmdirSync(src); } catch (e) {}
    } else {
      fs.renameSync(src, dest);
      const logLine = `↪ Realigned: ${from} ➔ ${to}`;
      console.log(logLine);
      stage3Report.operations.push({ from, to, status: "SUCCESS" });
    }
  } catch (err) {
    console.error(`❌ Stage 3 Move failed for ${from}:`, err.message);
    stage3Report.operations.push({ from, to, status: "FAILED", error: err.message });
  }
}

function runStage3() {
  console.log("==================================================");
  console.log("📦   SEVEN-OS AUTOSORTER STAGE 3 (CJS WRAPPER)    ");
  console.log("==================================================");
  console.log(`Active Corporate Workspace Root: ${ROOT}\n`);

  // 1. Phone / web UI migrations
  const UIModules = [ "src/web", "src/mobile" ];
  UIModules.forEach(item => {
    move(item, `utilities/mobile/${path.basename(item)}`);
  });

  // 2. SDK migrations
  move("src/sdk", "utilities/sdk/sdk");

  // 3. Core utils (constants/logger/response)
  const coreUtils = [ "src/utils/constants.js", "src/utils/logger.js", "src/utils/response.js" ];
  coreUtils.forEach(item => {
    move(item, `utilities/core/${path.basename(item)}`);
  });

  // 4. Legacy backend dashboards → utilities/dashboard/legacy
  const legacyDashboards = [ "backend/dashboard", "backend/public-dashboard" ];
  legacyDashboards.forEach(item => {
    move(item, `utilities/dashboard/legacy/${path.basename(item)}`);
  });

  // 5. Trust engine (OS‑core) → seven-os/system/trust
  const trustModules = [ "backend/trust-engine.js", "src/trust-engine.js" ];
  trustModules.forEach(item => {
    move(item, `seven-os/system/trust/${path.basename(item)}`);
  });

  // Compile synchronization metrics report
  stage3Report.status = "COMPLETE";
  stage3Report.totalOperations = stage3Report.operations.length;

  const targetReportFolder = path.join(ROOT, "seven-os", "system");
  if (!fs.existsSync(targetReportFolder)) {
    fs.mkdirSync(targetReportFolder, { recursive: true });
  }

  // Export report to your system folder for access by CLI helper tools
  fs.writeFileSync(
    path.join(targetReportFolder, "system-routing-map.json"),
    JSON.stringify(stage3Report, null, 2)
  );

  console.log("\n==================================================");
  console.log("✅ SEVEN-OS AUTOSORTER STAGE 3 METRICS COMPLETED");
  console.log(`   Total Legacy Subsystems Drained: ${stage3Report.totalOperations}`);
  console.log("   Report Matrix Exported to: seven-os/system/system-routing-map.json");
  console.log("==================================================");
}

runStage3();
