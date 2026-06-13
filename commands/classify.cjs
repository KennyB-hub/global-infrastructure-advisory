// Seven‑OS Auto‑Move Classifier (Manifest‑Aware)
// Reads Seven's manifest and moves files into correct OS/Runtime folders.

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

// Load Seven's giant manifest
const MANIFEST = JSON.parse(
  fs.readFileSync("./seven-os/global-manifest.json", "utf8")
);

// Target folders
const TARGETS = {
  core: "seven-os/core/",
  audit: "seven-os/audit/",
  config: "seven-os/config/",
  interfaces: "seven-os/interfaces/",
  utils: "seven-os/utils/",
  worker: "seven-os/worker/",
  runtime: "seven-runtime/"
};

// Protected folders (never classify or move)
const PROTECTED = [
  "commands/",
  "utilities/",
  "domain/",
  "api/",
  "sector-logic/",
  "infrastructure/",
  "backend/api/"
];

// Walk entire repo
function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, fileList);
    else fileList.push(full);
  }
  return fileList;
}

// Determine file role from manifest
function getRoleFromManifest(filePath) {
  const entry = MANIFEST.files?.find((f) => f.path === filePath);
  return entry?.role || "runtime";
}

// Move file safely
function moveFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.renameSync(src, dest);
}

function run() {
  console.log("\n🔍 Scanning repo for .cjs files...\n");

  const allFiles = walk(ROOT);
  const cjsFiles = allFiles.filter((f) => f.endsWith(".cjs"));

  for (const file of cjsFiles) {
    const relative = path.relative(ROOT, file).replace(/\\/g, "/");

    // 🚫 Skip protected folders
    if (PROTECTED.some((p) => relative.startsWith(p))) {
      console.log(`⏭️  Skipping protected file: ${relative}\n`);
      continue;
    }

    const role = getRoleFromManifest(relative);
    const targetFolder = TARGETS[role] || TARGETS.runtime;

    const dest = path.join(ROOT, targetFolder, path.basename(file));

    console.log(`➡️  ${relative}`);
    console.log(`    → ${dest}  (${role})\n`);

    moveFile(file, dest);
  }

  console.log("\n✅ Auto‑move complete.");
  console.log("Seven‑OS and Seven‑Runtime structure restored.\n");
}

run();
