#!/usr/bin/env node

// Seven‑OS Routing Scanner (v3/v12)
// Validates routing across sectors, system, api, workers, and runtime.

const { scanRouting } = require("../seven-os/system/routing/routing-scanner.js");
const { writeReport } = require("../utilities/write-report.cjs");

const repoRoot = path.resolve(__dirname, "..");

console.log("\n🔍 Seven‑OS Routing Scan (v3/v12)\n");

// Run routing scan
const issues = scanRouting(repoRoot);

// Print results
if (!issues.length) {
  console.log("✅ Routing is clean.\n");
} else {
  console.log(`⚠ Found ${issues.length} routing issues:\n`);
  for (const issue of issues) {
    console.log(JSON.stringify(issue, null, 2));
  }
}

// Write OS‑command‑view report
writeReport("routing-scan", {
  scannedAt: new Date().toISOString(),
  issues
});

console.log("📄 Routing scan report written.\n");

