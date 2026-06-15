#!/usr/bin/env node

// Seven‑OS Doctor – v3/v12 Sovereign Health Check
// Runs full integrity, routing, manifest, and runtime diagnostics.

const { spawnSync } = require("child_process");
const { writeReport } = require("../utilities/write-report.cjs");

function step(label, script) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    shell: true
  });

  if (result.status !== 0) {
    console.error(`❌ ${label} failed`);
    process.exit(1);
  }

  console.log(`✔ ${label} passed`);
}

function run() {
  console.log("\n🩺 Seven‑OS Doctor (v3/v12)\n");

  // --- Core repo integrity ---
  step("Clean", "clean");
  step("Deep Repo Audit", "scan:deep");
  step("Secret Scan", "scan:secrets");
  step("License Scan", "scan:licenses");
  step("Dependency Audit", "audit");

  // --- Runtime + sandbox ---
  step("CLI Sandbox Test", "test:cli-sandbox");
  step("WebSocket Verification", "verify:ws");
  step("Smoke Test", "smoke");

  // --- OS‑command‑view rebuild ---
  step("Routing Rebuild", "routing:rebuild");
  step("Manifest Rebuild", "manifest:rebuild");

  // --- Sector integrity ---
  step("Sector Integrity Scan", "scan:sectors");

  // --- Runtime logs health ---
  step("Runtime Log Audit", "scan:runtime-logs");

  console.log("\n🔥 Seven‑OS Doctor: All Systems Operational\n");

  writeReport("doctor", {
    status: "ok",
    timestamp: new Date().toISOString(),
    layers: [
      "runtime",
      "runtime-logs",
      "os-core",
      "system",
      "api",
      "workers",
      "sectors",
      "routing",
      "manifest",
      "reports"
    ]
  });
}

run();
