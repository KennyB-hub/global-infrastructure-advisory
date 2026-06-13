#!/usr/bin/env node

// Seven‑OS Hybrid Autosorter — Stage 3
// Cleans leftover web/mobile, SDK, core utils, trust engine, legacy dashboards.

const fs = require("fs");
const path = require("path");
const ROOT = process.cwd();

function move(from, to) {
  const src = path.join(ROOT, from);
  const dest = path.join(ROOT, to);
  if (!fs.existsSync(src)) return;

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  console.log(`↪️  ${from}  →  ${to}`);
  fs.renameSync(src, dest);
}

// --- Phone / web UI ---
[
  "src/web",
  "src/mobile",
].forEach(item => {
  move(item, "utilities/mobile/" + path.basename(item));
});

// --- SDK ---
[
  "src/sdk",
].forEach(item => {
  move(item, "utilities/sdk/" + path.basename(item));
});

// --- Core utils (constants/logger/response) ---
[
  "src/utils/constants.js",
  "src/utils/logger.js",
  "src/utils/response.js",
].forEach(item => {
  move(item, "utilities/core/" + path.basename(item));
});

// --- Legacy backend dashboards ---
[
  "backend/dashboard",
  "backend/public-dashboard",
].forEach(item => {
  move(item, "utilities/dashboard/legacy/" + path.basename(item));
});

// --- Trust engine (OS‑core) ---
[
  "backend/trust-engine.js",
  "src/trust-engine.js",
].forEach(item => {
  move(item, "seven-os/trust/" + path.basename(item));
});

console.log("\n✅ Hybrid OS Autosorter Stage 3 complete.\n");
