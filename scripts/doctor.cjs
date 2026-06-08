#!/usr/bin/env node

// Seven‑OS Doctor – Full System Health Check
// Runs all integrity, security, and runtime diagnostics.

import { spawnSync } from "child_process";

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

// Ordered health pipeline
step("Clean", "clean");
step("Deep Repo Audit", "scan:deep");
step("Secret Scan", "scan:secrets");
step("License Scan", "scan:licenses");
step("Dependency Audit", "audit");
step("CLI Sandbox Test", "test:cli-sandbox");
step("WebSocket Verification", "verify:ws");
step("Smoke Test", "smoke");

console.log("\n🔥 Seven‑OS Doctor: All Systems Operational");
