#!/usr/bin/env node

// Seven‑OS Full Routing Sync Engine
// Scans entire repo, classifies files, builds routing maps,
// detects missing connections, and writes a full report.

const { scanRepo } = require("../system/routing/routing-scanner.js");
const { classifyFiles } = require("../system/routing/routing-classifier.js");
const { buildRoutingMaps } = require("../system/routing/routing-builder.js");
const { validateRouting } = require("../system/routing/routing-validator.js");
const { writeRoutingReport } = require("../system/routing/routing-report.js");

const repoRoot = path.resolve(__dirname, "..");

console.log("\n🔄 Seven‑OS Full Routing Sync\n");

(async () => {
  const files = await scanRepo(repoRoot);
  const classified = classifyFiles(files);
  const maps = buildRoutingMaps(classified);
  const issues = validateRouting(maps);
  await writeRoutingReport(maps, issues);

  console.log(`\n📘 Routing sync complete.`);
  console.log(`📄 Report written to /reports/routing-report.json\n`);
})();
