#!/usr/bin/env node

// Seven‑OS Sector‑Aware Autoscan
// Scans repo and classifies files into sectors/subsystems based on keywords.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const SECTORS = {
  agriculture: { keywords: ["cattle", "livestock", "collar", "hauler", "load", "pasture", "farm", "ranch"], base: "seven-os/agriculture" },
  airports: { keywords: ["airport", "aviation", "runway", "faa"], base: "seven-os/airports" },
  climate: { keywords: ["climate", "weather", "carbon", "emissions"], base: "seven-os/climate" },
  cloud: { keywords: ["cloud", "compute", "azure", "vm", "container"], base: "seven-os/cloud" },
  cyber: { keywords: ["cyber", "security", "auth", "entra", "key", "audit"], base: "seven-os/cyber" },
  contractors: { keywords: ["contractor", "workforce", "labor"], base: "seven-os/contractors" },
  datacenters: { keywords: ["datacenter", "cooling", "rack", "server"], base: "seven-os/datacenters" },
  disaster_response: { keywords: ["disaster", "rescue", "evacuation", "incident"], base: "seven-os/disaster-response" },
  government: { keywords: ["gov", "policy", "regulation"], base: "seven-os/government" },
  logistics: { keywords: ["logistics", "supply", "freight", "shipment"], base: "seven-os/logistics" },
  mining: { keywords: ["mining", "ore", "extraction"], base: "seven-os/mining" },
  pipelines: { keywords: ["pipeline", "flow", "oil", "gas"], base: "seven-os/pipelines" },
  ports: { keywords: ["port", "maritime", "dock"], base: "seven-os/ports" },
  public_safety: { keywords: ["safety", "hazard", "incident"], base: "seven-os/public-safety" },
  rail: { keywords: ["rail", "train", "track"], base: "seven-os/rail" },
  roads: { keywords: ["road", "highway", "bridge"], base: "seven-os/roads" },
  telecom: { keywords: ["telecom", "fiber", "5g", "tower"], base: "seven-os/telecom" },
  water: { keywords: ["water", "treatment", "pump"], base: "seven-os/water" },
  economics: { keywords: ["economics", "market", "price", "forecast"], base: "seven-os/economics" },
  financial: { keywords: ["finance", "bank", "credit"], base: "seven-os/financial" },
  fcc: { keywords: ["fcc", "spectrum", "broadcast", "signal"], base: "seven-os/fcc" }
};

function listFiles(dir, debugMode = false) {
  const out = [];

  function walk(d) {
    const folder = d.toLowerCase();

    if (!debugMode) {
      if (folder.includes("node_modules")) return;
      if (folder.includes(".git")) return;
      if (folder.includes("proprietary-cli/node_modules")) return;
      if (folder.includes("public/assets/branding")) return;
    }

    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      const lower = full.toLowerCase();

      if (!debugMode) {
        if (lower.includes("node_modules")) continue;
        if (lower.includes(".git")) continue;
        if (lower.includes("proprietary-cli/node_modules")) continue;
        if (lower.includes("public/assets/branding")) continue;
      }

      if (e.isDirectory()) walk(full);
      else if (e.isFile()) out.push(full);
    }
  }

  walk(dir);
  return out;
}

function classify(relative) {
  const lower = relative.toLowerCase();

  // JSON logs inside runtime/logs
  if (lower.startsWith("runtime/logs/") && lower.endsWith(".json")) {
    return { type: "runtime-log", target: "runtime/logs", sector: null };
  }

  // JS runtime engines
  if (lower.startsWith("runtime/") && lower.endsWith(".js")) {
    return { type: "runtime", target: "runtime", sector: null };
  }

  // dashboards
  if (lower.includes("dashboard") || lower.includes("command-dashboard")) {
    return { type: "dashboard", target: "utilities/dashboard" };
  }

  // sector detection
  for (const [sector, cfg] of Object.entries(SECTORS)) {
    if (cfg.keywords.some(k => lower.includes(k))) {
      return { type: "sector", sector, target: cfg.base };
    }
  }

  return { type: "unknown", target: null };
}

function run() {
  const debugMode = process.argv.includes("debug");

  const files = listFiles(ROOT, debugMode)
    .map(f => path.relative(ROOT, f).replace(/\\/g, "/"));

  const groups = { runtime: [], "runtime-log": [], dashboard: [], sector: [], unknown: [] };

  for (const rel of files) {
    const c = classify(rel);
    groups[c.type].push({ file: rel, target: c.target, sector: c.sector });
  }

  console.log("📂 Autoscan classification\n");
  console.log("Debug Mode:", debugMode ? "ON" : "OFF");
  console.log("");

  console.log("runtime:");
  groups.runtime.forEach(f => console.log("  -", f.file));

  console.log("\nruntime-log:");
  groups["runtime-log"].forEach(f => console.log("  -", f.file));

  console.log("\ndashboard:");
  groups.dashboard.forEach(f => console.log("  -", f.file, "→", f.target));

  console.log("\nsector‑mapped:");
  groups.sector.forEach(f => console.log("  -", f.file, "→", f.target, `(${f.sector})`));

  console.log("\nunknown:");
  groups.unknown.forEach(f => console.log("  -", f.file));

  const { writeReport } = require("../utilities/write-report.cjs");
  writeReport("autoscan", groups);
}

run();
