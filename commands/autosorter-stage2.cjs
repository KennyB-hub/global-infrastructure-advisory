#!/usr/bin/env node

// Seven‑OS Autosorter Stage 2 (v3/v12)
// Cleans seven-os by moving misplaced files INTO correct OS layers.

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

// --- Move OS-core engines into seven-os/system ---
[
  "seven-os/threat",
  "seven-os/analysis",
  "seven-os/logs",
  "seven-os/infra",
  "seven-os/sensors"
].forEach(item => {
  move(item, `seven-os/system/${path.basename(item)}`);
});

// --- Move API engines into seven-os/api ---
[
  "seven-os/api/opportunity.js",
  "seven-os/api/opportunities-active.js",
  "seven-os/api/marketplace.js",
  "seven-os/api/program-matching-dashboard.js",
  "seven-os/api/contractors.js",
  "seven-os/api/donors.js"
].forEach(item => {
  move(item, `seven-os/api/${path.basename(item)}`);
});

// --- Move workers into seven-os/workers ---
[
  "seven-os/workers/debug",
  "seven-os/workers/finance",
  "seven-os/workers/project-search-worker.js",
  "seven-os/workers/log-ingestion-worker.js"
].forEach(item => {
  move(item, `seven-os/workers/${path.basename(item)}`);
});

// --- Move dashboards into seven-os/system/ui ---
[
  "seven-os/api/map",
  "seven-os/api/command-dashboard.ts",
  "seven-os/logs/log-ui-dashboard.js",
  "seven-os/cattle/dashboard.ts"
].forEach(item => {
  move(item, `seven-os/system/ui/${path.basename(item)}`);
});

// --- Move map engines into seven-os/system/map ---
[
  "seven-os/api/map/map.html",
  "seven-os/api/map/map.js"
].forEach(item => {
  move(item, `seven-os/system/map/${path.basename(item)}`);
});

console.log("\n✅ Seven‑OS Autosorter Stage 2 (v3/v12) complete.\n");
