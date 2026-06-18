// © 2026 Global Infrastructure Advisory
// Seven‑OS Runtime Restorer v1
// Recovers misplaced runtime files and rebuilds seven-runtime/

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

const RUNTIME_DIR = path.join(ROOT, "seven-runtime");
const ARCHIVE_DIR = path.join(ROOT, "var", "archive", "runtime-misplaced");

const RUNTIME_KEYWORDS = [
  "runtime",
  "runtime",
  "decision",
  "autonomous",
  "state",
  "scheduler",
  "event-loop",
  "worker-core",
  "runtime-core",
  "runtime-engine"
];

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function hashFile(file) {
  const data = fs.readFileSync(file);
  return crypto.createHash("sha256").update(data).digest("hex");
}

function isRuntimeFile(file) {
  const name = path.basename(file).toLowerCase();
  return RUNTIME_KEYWORDS.some((k) => name.includes(k));
}

function moveRuntimeFile(src) {
  ensureDir(RUNTIME_DIR);
  const dest = path.join(RUNTIME_DIR, path.basename(src));

  if (fs.existsSync(dest)) {
    const h1 = hashFile(src);
    const h2 = hashFile(dest);

    if (h1 === h2) {
      console.log(`🟡 Duplicate runtime file archived: ${src}`);
      ensureDir(ARCHIVE_DIR);
      fs.renameSync(src, path.join(ARCHIVE_DIR, path.basename(src)));
      return;
    }

    const renamed = dest.replace(".ts", `.dup-${Date.now()}.ts`);
    console.log(`🟠 Runtime conflict — renaming ${src}`);
    fs.renameSync(src, renamed);
    return;
  }

  fs.renameSync(src, dest);
  console.log(`📦 Restored runtime file: ${src} → ${dest}`);
}

function scanAndRestore(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "seven-runtime") continue;
      if (entry.name === "node_modules") continue;
      if (entry.name === ".git") continue;

      scanAndRestore(full);
      continue;
    }

    if (entry.isFile() && isRuntimeFile(full)) {
      moveRuntimeFile(full);
    }
  }
}

function main() {
  console.log("🛠 Seven‑OS Runtime Restorer — Starting...\n");

  ensureDir(RUNTIME_DIR);
  ensureDir(ARCHIVE_DIR);

  scanAndRestore(ROOT);

  console.log("\n✅ Seven‑Runtime restored.");
}

main();
