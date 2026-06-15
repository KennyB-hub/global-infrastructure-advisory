#!/usr/bin/env node

// Seven‑OS Sector‑Aware Autosorter (v3)
// Moves files into correct global sectors based on autoscan classification.

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

// Load latest autoscan report from /reports/
function getLatestAutoscanReport() {
  const reportsDir = path.join(ROOT, "reports");

  if (!fs.existsSync(reportsDir)) {
    console.error("❌ No /reports directory found. Run autoscan first.");
    process.exit(1);
  }

  const files = fs.readdirSync(reportsDir)
    .filter(f => f.startsWith("autoscan-") && f.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error("❌ No autoscan reports found in /reports/. Run autoscan first.");
    process.exit(1);
  }

  const latest = path.join(reportsDir, files[0]);
  console.log(`📄 Using autoscan report: ${files[0]}`);

  return JSON.parse(fs.readFileSync(latest, "utf8"));
}

const autoscan = getLatestAutoscanReport();

function moveFile(srcRel, destRel) {
  const src = path.join(ROOT, srcRel);
  const dest = path.join(ROOT, destRel);

  if (!fs.existsSync(src)) {
    console.log(`⚠️ Missing: ${srcRel}`);
    return;
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });

  console.log(`↪️  ${srcRel} → ${destRel}`);
  fs.renameSync(src, dest);
}

function run() {
  console.log("\n📦 Seven‑OS Sector Autosorter (v3)\n");

  // Only move sector‑classified files
  autoscan.sector.forEach(entry => {
    const { file, sector } = entry;

    // Build destination path
    const relative = file.replace(/^seven-os\//, "");
    const dest = `seven-os/sectors/${sector}/${relative}`;

    moveFile(file, dest);
  });

  console.log("\n✅ Sector autosort complete.");
  console.log("Next: rebuild routing + rebuild manifest.\n");

  const { writeReport } = require("../utilities/write-report.cjs");
  writeReport("autosorter", autoscan);
}

run();

