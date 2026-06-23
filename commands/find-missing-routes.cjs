#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "seven-os", "manifest.json");
const REPORT_PATH = path.join(ROOT, "reports", "missing-routes.json");
const { writeReport } = require("../utilities/write-report.cjs");

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
  console.log("🧭 Detecting missing routes…");

  const manifest = safeReadJSON(MANIFEST_PATH);
  if (!manifest) {
    console.error("❌ manifest.json missing or invalid.");
    process.exit(1);
  }

  const routes = manifest.routes || {};
  const allFiles = walk(ROOT);

  const missing = {};
  for (const file of allFiles) {
    // Skip non‑code files if you want:
    if (!file.endsWith(".js") && !file.endsWith(".cjs") && !file.endsWith(".ts")) continue;

    const alreadyMapped = Object.values(routes).includes(file);
    if (!alreadyMapped) {
      missing[file] = {
        suggestedRouteKey: file.replace(/[\/\\]/g, ":").replace(/\.(js|cjs|ts)$/, ""),
      };
    }
  }

  const reportsDir = path.join(ROOT, "reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

  fs.writeFileSync(REPORT_PATH, JSON.stringify({ timestamp: new Date().toISOString(), missing }, null, 2));

  console.log("✅ Missing routes report generated at:");
  console.log("   " + REPORT_PATH);
}

main();
