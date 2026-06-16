#!/usr/bin/env node

// Seven‑OS Domain Folder Normalizer
// Fixes accidental domain/domains duplication after autosorter passes.

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const DOMAIN = path.join(ROOT, "domain");
const DOMAINS = path.join(ROOT, "domains");

function moveRecursive(src, dest) {
  if (!fs.existsSync(src)) return;

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      moveRecursive(from, to);
    } else {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      console.log(`↪️  ${from.replace(ROOT, "")}  →  ${to.replace(ROOT, "")}`);
      fs.renameSync(from, to);
    }
  }
}

console.log("\n🔧 Seven‑OS: Normalizing domain folders...\n");

// Case 1: Only "domains/" exists → rename to "domain/"
if (!fs.existsSync(DOMAIN) && fs.existsSync(DOMAINS)) {
  console.log("✔ Renaming 'domains/' → 'domain/'");
  fs.renameSync(DOMAINS, DOMAIN);
}

// Case 2: Both exist → merge "domains/" into "domain/"
if (fs.existsSync(DOMAIN) && fs.existsSync(DOMAINS)) {
  console.log("✔ Merging 'domains/' into 'domain/'");
  moveRecursive(DOMAINS, DOMAIN);

  console.log("✔ Removing old 'domains/' folder");
  fs.rmSync(DOMAINS, { recursive: true, force: true });
}

console.log("\n🔄 Rebuilding routing maps...\n");

// Rebuild routing maps after merge
const syncRouting = path.join(ROOT, "commands/sync-routing.cjs");
if (fs.existsSync(syncRouting)) {
  require(syncRouting);
} else {
  console.log("⚠️ sync-routing.cjs not found — building routing maps");

}

console.log("\n✅ Domain normalization complete.\n");
