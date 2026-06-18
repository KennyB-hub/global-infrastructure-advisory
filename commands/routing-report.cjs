#!/usr/bin/env node

/**
 * Seven‑OS Routing Report Generator
 * Node 24 Safe • CJS Compatible • No destructive actions
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "manifest.json");
const REPORT_PATH = path.join(ROOT, "reports", "routing-report.json");

function safeReadJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function walk(dir, list = []) {
  if (!fs.existsSync(dir)) return list;

  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) walk(full, list);
    else list.push(full.replace(ROOT + path.sep, ""));
  }

  return list;
}

function main() {
  console.log("📡 Generating Seven‑OS Routing Report…");

  const manifest = safeReadJSON(MANIFEST_PATH);
  if (!manifest) {
    console.error("❌ No manifest.json found.");
    process.exit(1);
  }

  const allFiles = walk(ROOT);
  const mapped = new Set(Object.values(manifest.routes || {}));
  const unmapped = allFiles.filter(f => !mapped.has(f));

  const report = {
    timestamp: new Date().toISOString(),
    root: ROOT,
    manifestStats: {
      totalRoutes: Object.keys(manifest.routes || {}).length,
      totalDomains: Object.keys(manifest.domains || {}).length,
      totalEngines: Object.keys(manifest.engines || {}).length,
    },
    fileStats: {
      totalFiles: allFiles.length,
      mappedFiles: mapped.size,
      unmappedFiles: unmapped.length,
    },
    unmappedFiles,
    manifest,
  };

  // Ensure /reports directory exists
  const reportsDir = path.join(ROOT, "reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log("✅ Routing report generated:");
  console.log("   " + REPORT_PATH);
}

main();
