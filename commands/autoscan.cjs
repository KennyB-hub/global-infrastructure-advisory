// auto-scan.cjs
// Scans the entire repo and reports where files SHOULD belong.
// Does NOT move anything. Safe to run anytime.

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

// Root-level global folders (your old map)
const GLOBAL_FOLDERS = {
  ai: "ai/",
  backend: "backend/",
  functions: "functions/",
  api: "functions/api/",
  cli: "proprietary-cli/",
  sandbox: "sandbox/",
  security: "security/",
  sectors: "sectors/",
  geo: "geo-utilities/",
  hubs: "hubs/",
  hub_logic: "hub_logic/",
  identity: "identity/",
  infra: "infrastructure-packs/",
  kv: "kv/",
  policy: "policy-packs/",
  public: "public/",
  reports: "reports/",
  scripts: "scripts/",
  system: "system/",
  templates: "templates/",
  topology: "topology/"
};

// OS and Runtime folders
const OS_FOLDER = "seven-os/";
const RUNTIME_FOLDER = "seven-runtime/";
const WORKERS_FOLDER = "workers/";

// Utility: walk all files
function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);

    // Skip node_modules, .git, and autoscan itself
    if (full.includes("node_modules")) continue;
    if (full.includes(".git")) continue;
    if (full.includes("autoscan.cjs")) continue;

    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, fileList);
    else fileList.push(full);
  }
  return fileList;
}

// Determine where a file SHOULD belong
function classify(file) {
  const relative = path.relative(ROOT, file).replace(/\\/g, "/");

  // 1. Check global folders
  for (const key in GLOBAL_FOLDERS) {
    if (relative.startsWith(GLOBAL_FOLDERS[key])) {
      return { file: relative, target: GLOBAL_FOLDERS[key], type: "global" };
    }
  }

  // 2. OS folder
  if (relative.startsWith(OS_FOLDER)) {
    return { file: relative, target: OS_FOLDER, type: "seven-os" };
  }

  // 3. Runtime folder
  if (relative.startsWith(RUNTIME_FOLDER)) {
    return { file: relative, target: RUNTIME_FOLDER, type: "seven-runtime" };
  }

  // 4. Workers
  if (relative.startsWith(WORKERS_FOLDER)) {
    return { file: relative, target: WORKERS_FOLDER, type: "worker" };
  }

  // 5. Unknown → needs relocation
  return { file: relative, target: "UNKNOWN", type: "unclassified" };
}

function run() {
  console.log("\n🔍 Running Seven Auto‑Scan (read‑only)...\n");

  const allFiles = walk(ROOT);
  const results = allFiles.map(classify);

  const groups = {
    global: [],
    "seven-os": [],
    "seven-runtime": [],
    worker: [],
    unclassified: []
  };

  for (const r of results) {
    groups[r.type].push(r.file);
  }

  console.log("📁 GLOBAL FILES:");
  console.log(groups.global.join("\n") || "None");
  console.log("\n📁 SEVEN‑OS FILES:");
  console.log(groups["seven-os"].join("\n") || "None");
  console.log("\n📁 SEVEN‑RUNTIME FILES:");
  console.log(groups["seven-runtime"].join("\n") || "None");
  console.log("\n📁 WORKER FILES:");
  console.log(groups.worker.join("\n") || "None");
  console.log("\n⚠️ UNCLASSIFIED FILES (need manual review):");
  console.log(groups.unclassified.join("\n") || "None");

  console.log("\n✅ Auto‑scan complete. No files were moved.\n");
}

run();
