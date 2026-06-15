#!/usr/bin/env node

// Seven‑OS Routing Sync (v3/v12)
// Rebuilds routing maps for system, api, workers, sectors, and runtime.

const fs = require("fs");
const path = require("path");
const { writeReport } = require("../utilities/write-report.cjs");

const ROOT = process.cwd();

// Utility: walk a directory and collect .js/.ts files
function collectFiles(baseDir) {
  const results = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".js") || entry.name.endsWith(".ts")) {
        results.push(full.replace(baseDir, "").replace(/\\/g, "/"));
      }
    }
  }

  walk(baseDir);
  return results;
}

// --- Build API routing map ---
function rebuildApiMap() {
  const apiDir = path.join(ROOT, "seven-os", "api");
  const routes = collectFiles(apiDir);

  const map = { routes };
  fs.writeFileSync(
    path.join(ROOT, "seven-os/system/api-routing-map.json"),
    JSON.stringify(map, null, 2)
  );

  console.log("✔ API routing map rebuilt");
  return map;
}

// --- Build System routing map ---
function rebuildSystemMap() {
  const sysDir = path.join(ROOT, "seven-os", "system");
  const modules = collectFiles(sysDir);

  const map = { modules };
  fs.writeFileSync(
    path.join(ROOT, "seven-os/system/system-routing-map.json"),
    JSON.stringify(map, null, 2)
  );

  console.log("✔ System routing map rebuilt");
  return map;
}

// --- Build Worker routing map ---
function rebuildWorkerMap() {
  const workersDir = path.join(ROOT, "seven-os", "workers");
  const workers = collectFiles(workersDir);

  const map = { workers };
  fs.writeFileSync(
    path.join(ROOT, "seven-os/system/worker-routing-map.json"),
    JSON.stringify(map, null, 2)
  );

  console.log("✔ Worker routing map rebuilt");
  return map;
}

// --- Build Sector routing map ---
function rebuildSectorMap() {
  const sectorsDir = path.join(ROOT, "seven-os", "sectors");
  const sectors = {};

  if (!fs.existsSync(sectorsDir)) {
    console.log("✔ No sectors found — skipping sector routing");
    return { sectors: {} };
  }

  const sectorNames = fs.readdirSync(sectorsDir);

  for (const sector of sectorNames) {
    const sectorPath = path.join(sectorsDir, sector);
    if (!fs.statSync(sectorPath).isDirectory()) continue;

    sectors[sector] = collectFiles(sectorPath);
  }

  const map = { sectors };
  fs.writeFileSync(
    path.join(ROOT, "seven-os/system/sector-routing-map.json"),
    JSON.stringify(map, null, 2)
  );

  console.log("✔ Sector routing map rebuilt");
  return map;
}

// --- Build Runtime routing map ---
function rebuildRuntimeMap() {
  const rtDir = path.join(ROOT, "runtime");
  if (!fs.existsSync(rtDir)) {
    console.log("✔ Runtime clean — no routing map needed");
    return { runtime: [] };
  }

  const runtime = collectFiles(rtDir);

  const map = { runtime };
  fs.writeFileSync(
    path.join(ROOT, "seven-os/system/runtime-routing-map.json"),
    JSON.stringify(map, null, 2)
  );

  console.log("✔ Runtime routing map rebuilt");
  return map;
}

// --- Orchestrate full routing sync ---
console.log("\n🔄 Syncing Seven‑OS routing (v3/v12)...\n");

const apiMap = rebuildApiMap();
const systemMap = rebuildSystemMap();
const workerMap = rebuildWorkerMap();
const sectorMap = rebuildSectorMap();
const runtimeMap = rebuildRuntimeMap();

// Write OS‑command‑view report
writeReport("routing-sync", {
  syncedAt: new Date().toISOString(),
  api: apiMap,
  system: systemMap,
  workers: workerMap,
  sectors: sectorMap,
  runtime: runtimeMap
});

console.log("\n✅ Routing sync complete.\n");
console.log("🔧 Seven‑OS: routing tables rebuilt for all layers.\n");
