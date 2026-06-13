#!/usr/bin/env node

// Seven‑OS Full Repository Autoscan

const path = require("path");
const fs = require("fs");

const ROOT = process.cwd();

const SUBSYSTEMS = [
  "seven-runtime",
  "seven-os",
  "domain",
  "utilities",
  "api",
  "commands",
  "seven-os/voice",
  "seven-os/governance",
  "seven-os/mcp",
  "seven-os/mci",
  "services",
  "interop",
  "dashboard",
  "workers",
  "intelligence"
];

function scanFolder(folder) {
  const fullPath = path.join(ROOT, folder);
  if (!fs.existsSync(fullPath)) return [];

  const results = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath);
      } else {
        results.push(entryPath.replace(ROOT + path.sep, ""));
      }
    }
  }

  walk(fullPath);
  return results;
}

function classify(file) {
  const f = file.toLowerCase();

  if (f.includes("seven-os")) return "os-core";
  if (f.includes("seven-runtime")) return "runtime";
  if (f.includes("domain")) return "domain";
  if (f.includes("api")) return "api";
  if (f.includes("utilities")) return "utilities";
  if (f.includes("commands")) return "commands";
  if (f.includes("voice")) return "voice";
  if (f.includes("governance")) return "governance";
  if (f.includes("mcp")) return "mcp";
  if (f.includes("mci")) return "mci";
  if (f.includes("services")) return "services";
  if (f.includes("interop")) return "interop";
  if (f.includes("dashboard")) return "dashboard";
  if (f.includes("workers")) return "workers";
  if (f.includes("intelligence")) return "intelligence";

  return "unknown";
}

console.log("\n🔍 Running Seven‑OS Full Repository Autoscan...\n");

const report = {};

for (const subsystem of SUBSYSTEMS) {
  console.log(`📁 Scanning ${subsystem}/ ...`);
  const files = scanFolder(subsystem);

  for (const file of files) {
    const type = classify(file);
    if (!report[type]) report[type] = [];
    report[type].push(file);
  }
}

console.log("\n📊 Autoscan Complete.\n");

for (const [type, files] of Object.entries(report)) {
  console.log(`\n=== ${type.toUpperCase()} ===`);
  files.forEach(f => console.log("• " + f));
}

console.log("\n✅ Full OS autoscan finished.\n");
