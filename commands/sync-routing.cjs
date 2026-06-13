#!/usr/bin/env node

// Seven‑OS Routing Sync
// Rebuilds API map, OS map, Domain map, and Runtime map after autosorter passes.

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function rebuildApiMap() {
  const apiDir = path.join(ROOT, "api");
  const routes = [];

  function walk(dir, prefix = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel = full.replace(apiDir, "").replace(/\\/g, "/");

      if (entry.isDirectory()) {
        walk(full, prefix + "/" + entry.name);
      } else if (entry.name.endsWith(".js") || entry.name.endsWith(".ts")) {
        routes.push(prefix + "/" + entry.name.replace(/\.(js|ts)$/, ""));
      }
    }
  }

  walk(apiDir);

  const map = { routes };
  fs.writeFileSync(path.join(ROOT, "seven-os/system/api-routing-map.json"), JSON.stringify(map, null, 2));
  console.log("✔ API routing map rebuilt");
}

function rebuildOsMap() {
  const osDir = path.join(ROOT, "seven-os");
  const modules = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".js") || entry.name.endsWith(".ts")) {
        modules.push(full.replace(osDir, "").replace(/\\/g, "/"));
      }
    }
  }

  walk(osDir);

  const map = { modules };
  fs.writeFileSync(path.join(ROOT, "seven-os/system/os-routing-map.json"), JSON.stringify(map, null, 2));
  console.log("✔ OS routing map rebuilt");
}

function rebuildDomainMap() {
  const domainDir = path.join(ROOT, "domain");
  const logic = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".js") || entry.name.endsWith(".ts")) {
        logic.push(full.replace(domainDir, "").replace(/\\/g, "/"));
      }
    }
  }

  walk(domainDir);

  const map = { logic };
  fs.writeFileSync(path.join(ROOT, "seven-os/system/domain-routing-map.json"), JSON.stringify(map, null, 2));
  console.log("✔ Domain routing map rebuilt");
}

function rebuildRuntimeMap() {
  const rtDir = path.join(ROOT, "seven-runtime");
  if (!fs.existsSync(rtDir)) {
    console.log("✔ Runtime clean — no routing map needed");
    return;
  }

  const workers = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".js") || entry.name.endsWith(".ts")) {
        workers.push(full.replace(rtDir, "").replace(/\\/g, "/"));
      }
    }
  }

  walk(rtDir);

  const map = { workers };
  fs.writeFileSync(path.join(ROOT, "seven-os/system/runtime-routing-map.json"), JSON.stringify(map, null, 2));
  console.log("✔ Runtime routing map rebuilt");
}

console.log("\n🔄 Syncing Seven‑OS routing...\n");

rebuildApiMap();
rebuildOsMap();
rebuildDomainMap();
rebuildRuntimeMap();

console.log("\n✅ Routing sync complete.\n");
// sync-routing.cjs
console.log("🔧 Seven-OS: sync-routing starting...");
// TODO: regenerate routing tables for hubs/dashboards/trust zones
