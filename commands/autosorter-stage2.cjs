#!/usr/bin/env node

// Seven‑OS Hybrid Autosorter — Stage 2
// Cleans seven-os by moving non‑OS logic into domain/utilities/api

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

// --- UI / HTML / Dashboard out of seven-os ---
[
  "seven-os/api/map",
  "seven-os/api/command-dashboard.ts",
  "seven-os/logs/log-ui-dashboard.js",
].forEach(item => {
  move(item, `utilities/ui/${path.basename(item)}`);
});

// --- Move HTML/JS map engines ---
[
  "seven-os/api/map/map.html",
  "seven-os/api/map/map.js",
].forEach(item => {
  move(item, `utilities/map/${path.basename(item)}`);
});

// --- Move sector intelligence out of seven-os ---
[
  "seven-os/threat",
  "seven-os/analysis",
].forEach(item => {
  move(item, `domain/infrastructure/${path.basename(item)}`);
});

// --- Move ingest pipelines ---
[
  "seven-os/infra/ingest.ts",
  "seven-os/infra/tower/ingest.ts",
].forEach(item => {
  move(item, `domain/infrastructure/ingest/${path.basename(item)}`);
});

// --- Move sensors ---
[
  "seven-os/sensors",
].forEach(item => {
  move(item, `domain/infrastructure/sensors`);
});

// --- Move workers (non‑OS workers) ---
[
  "seven-os/workers/debug",
  "seven-os/workers/finance",
  "seven-os/workers/project-search-worker.js",
  "seven-os/workers/log-ingestion-worker.js",
].forEach(item => {
  move(item, `domain/infrastructure/workers/${path.basename(item)}`);
});

// --- Move non‑OS API routes ---
[
  "seven-os/api/opportunity.js",
  "seven-os/api/opportunities-active.js",
  "seven-os/api/marketplace.js",
  "seven-os/api/program-matching-dashboard.js",
  "seven-os/api/contractors.js",
  "seven-os/api/donors.js",
].forEach(item => {
  move(item, `api/${path.basename(item)}`);
});

// --- Move UI dashboards out of seven-os ---
[
  "seven-os/cattle/dashboard.ts",
].forEach(item => {
  move(item, `utilities/dashboard/${path.basename(item)}`);
});

console.log("\n✅ Hybrid OS Autosorter Stage 2 complete.\n");
