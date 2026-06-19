#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "seven-os", "manifest.json");
const MISSING_PATH = path.join(ROOT, "reports", "missing-routes.json");
const { writeReport } = require("../utilities/write-report.cjs");

function safeReadJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function main() {
  console.log("⚙️ Auto‑generating routes from missing‑routes report…");

  const manifest = safeReadJSON(MANIFEST_PATH);
  if (!manifest) {
    console.error("❌ manifest.json missing or invalid.");
    process.exit(1);
  }

  const missingReport = safeReadJSON(MISSING_PATH);
  if (!missingReport || !missingReport.missing) {
    console.error("❌ missing-routes.json not found or invalid. Run find-missing-routes first.");
    process.exit(1);
  }

  const routes = manifest.routes || {};
  let added = 0;

  for (const [file, info] of Object.entries(missingReport.missing)) {
    const key = info.suggestedRouteKey;
    if (!routes[key]) {
      routes[key] = file;
      added++;
    }
  }

  manifest.routes = routes;

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log(`✅ Added ${added} new routes to manifest.json`);
}

main();
