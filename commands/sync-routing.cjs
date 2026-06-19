#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "seven-os", "manifest.json");
const ROUTING_STATE_PATH = path.join(ROOT, "reports", "routing-state.json");
const { writeReport } = require("../utilities/write-report.cjs");

function safeReadJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function main() {
  console.log("🔄 Syncing routing state from manifest…");

  const manifest = safeReadJSON(MANIFEST_PATH);
  if (!manifest) {
    console.error("❌ manifest.json missing or invalid.");
    process.exit(1);
  }

  const routes = manifest.routes || {};

  const state = {
    timestamp: new Date().toISOString(),
    totalRoutes: Object.keys(routes).length,
    routes,
  };

  const reportsDir = path.join(ROOT, "reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

  fs.writeFileSync(ROUTING_STATE_PATH, JSON.stringify(state, null, 2));

  console.log("✅ Routing state synced to:");
  console.log("   " + ROUTING_STATE_PATH);
}

main();

