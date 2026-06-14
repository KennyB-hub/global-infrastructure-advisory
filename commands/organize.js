// © 2026 Global Infrastructure Advisory
// Seven‑OS Intelligent Organizer v3
// Purpose‑Based, Type‑Based, Duplicate‑Aware, Domain‑Aware Organizer

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = __dirname;

// Seven‑OS core folders (never touched)
const PROTECTED = new Set([
  "seven-os",
  "transports",
  "commands",
  "scripts",
  "tests",
  "node_modules",
  ".git",
  ".vscode",
  "var"
]);

// Target folders
const TARGETS = {
  domain: "seven-os/domain",
  api: "seven-os/api",
  runtime: "seven-os/runtime",
  transports: "transports",
  commands: "commands",
  scripts: "scripts",
  tests: "tests",
  config: "config",
  archive: "var/archive/misc"
};

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function hashFile(file) {
  const data = fs.readFileSync(file);
  return crypto.createHash("sha256").update(data).digest("hex");
}

function detectPurpose(file) {
  const name = path.basename(file).toLowerCase();

  if (name.includes("domain") || name.endsWith(".domain.ts")) return "domain";
  if (name.includes("api") || name.endsWith(".api.ts")) return "api";
  if (name.includes("runtime") || name.includes("seven-runtime")) return "runtime";
  if (name.includes("nats") || name.includes("transport")) return "transports";
  if (name.includes("command") || name.endsWith(".cjs")) return "commands";
  if (name.includes("test") || name.endsWith(".spec.ts")) return "tests";
  if (name.includes("config") || name.endsWith(".config.js")) return "config";

  return "unknown";
}

function moveFile(src, destFolder) {
  ensureDir(destFolder);
  const dest = path.join(destFolder, path.basename(src));

  if (fs.existsSync(dest)) {
    console.log(`⚠️ Duplicate detected: ${src}`);
    const hash1 = hashFile(src);
    const hash2 = hashFile(dest);

    if (hash1 === hash2) {
      console.log(`🟡 Exact duplicate — archiving ${src}`);
      moveFile(src, TARGETS.archive);
      return;
    } else {
      console.log(`🟠 Different content — renaming ${src}`);
      const renamed = dest.replace(".ts", `.dup-${Date.now()}.ts`);
      fs.renameSync(src, renamed);
      return;
    }
  }

  fs.renameSync(src, dest);
  console.log(`📦 Moved: ${src} → ${dest}`);
}

function organizeRoot() {
  console.log("🧭 Seven‑OS Organizer v3: Scanning root...\n");

  const entries = fs.readdirSync(ROOT);

  for (const entry of entries) {
    const full = path.join(ROOT, entry);

    if (PROTECTED.has(entry)) continue;
    if (!fs.lstatSync(full).isFile()) continue;

    const purpose = detectPurpose(full);

    switch (purpose) {
      case "domain":
        moveFile(full, TARGETS.domain);
        break;
      case "api":
        moveFile(full, TARGETS.api);
        break;
      case "runtime":
        moveFile(full, TARGETS.runtime);
        break;
      case "transports":
        moveFile(full, TARGETS.transports);
        break;
      case "commands":
        moveFile(full, TARGETS.commands);
        break;
      case "scripts":
        moveFile(full, TARGETS.scripts);
        break;
      case "tests":
        moveFile(full, TARGETS.tests);
        break;
      case "config":
        moveFile(full, TARGETS.config);
        break;
      default:
        moveFile(full, TARGETS.archive);
        break;
    }
  }
}

function main() {
  console.log("🧹 Seven‑OS Intelligent Organizer v3 — Starting...\n");

  Object.values(TARGETS).forEach((dir) => ensureDir(path.join(ROOT, dir)));

  organizeRoot();

  console.log("\n✅ Seven‑OS Organizer: Structure normalized.");
}

main();
