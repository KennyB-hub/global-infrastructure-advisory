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

#!/usr/bin/env node

// Seven‑OS Autosorter Stage 3 (v3/v12)
// Drains legacy backend/src holders into Seven‑OS + utilities.

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

// --- Legacy backend dashboards → utilities/dashboard/legacy ---
[
  "backend/dashboard",
  "backend/public-dashboard",
].forEach(item => {
  move(item, "utilities/dashboard/legacy/" + path.basename(item));
});

// --- Trust engine (OS‑core) → seven-os/system/trust ---
[
  "backend/trust-engine.js",
  "src/trust-engine.js",
].forEach(item => {
  move(item, "seven-os/system/trust/" + path.basename(item));
});

console.log("\n✅ Seven‑OS Autosorter Stage 3 (v3/v12) complete.\n");
