#!/usr/bin/env node

// Seven‑OS Smoke Test – V12 Alpha
// Ensures core systems boot without crashing.

import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function run(label, cmd, args) {
  const result = spawnSync(cmd, args, { stdio: "pipe", encoding: "utf8" });

  if (result.status !== 0) {
    console.error(`❌ ${label} failed`);
    console.error(result.stderr || result.stdout);
    process.exit(1);
  }

  console.log(`✔ ${label} passed`);
}

// 1. CLI boot test
run(
  "CLI boot",
  "node",
  [path.join(__dirname, "..", "proprietary-cli", "bin", "cli.js"), "help"]
);

// 2. WS engine boot test
run(
  "WebSocket engine",
  "node",
  [path.join(__dirname, "..", "src", "backend", "ws", "run-collar-ws.js")]
);

// 3. Runtime import test
try {
  await import(path.join(__dirname, "..", "seven-runtime", "index.js"));
  console.log("✔ Runtime import passed");
} catch (err) {
  console.error("❌ Runtime import failed");
  console.error(err);
  process.exit(1);
}

console.log("🔥 Seven‑OS Smoke Test Complete");
