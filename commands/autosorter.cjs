#!/usr/bin/env node

// Seven‑OS Full Repository Autosorter
// Moves obviously misplaced files out of seven-runtime into correct layers.

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function move(from, to) {
  const src = path.join(ROOT, from);
  const dest = path.join(ROOT, to);

  if (!fs.existsSync(src)) {
    console.log(`⚠️  Missing: ${from}`);
    return;
  }

  const destDir = path.dirname(dest);
  fs.mkdirSync(destDir, { recursive: true });

  console.log(`↪️  ${from}  →  ${to}`);
  fs.renameSync(src, dest);
}

// --- RUNTIME → API ---
[
  "seven-runtime/api",
].forEach(dir => {
  if (fs.existsSync(path.join(ROOT, dir))) {
    move(dir, "api");
  }
});

// --- RUNTIME → UTILITIES (dashboard UI, helpers, services, tools) ---
[
  "seven-runtime/dashboard",
  "seven-runtime/functions",
  "seven-runtime/services",
  "seven-runtime/security/tools",
  "seven-runtime/geo",
].forEach(dir => {
  if (fs.existsSync(path.join(ROOT, dir))) {
    move(dir, "utilities/" + path.basename(dir));
  }
});

// --- RUNTIME → DOMAIN (intelligence, matching, security-audit, workers) ---
[
  "seven-runtime/intelligence",
  "seven-runtime/matching",
  "seven-runtime/security/security-audit.js",
  "seven-runtime/tools/run-repo-audit.ts",
  "seven-runtime/workers",
].forEach(item => {
  const src = path.join(ROOT, item);
  if (!fs.existsSync(src)) return;

  const base = path.basename(item);
  const isFile = fs.statSync(src).isFile();
  const dest = isFile
    ? `domain/infrastructure/${base}`
    : `domain/infrastructure/${base}`;

  move(item, dest);
});

// --- RUNTIME → SEVEN-OS (core routing, os.json, seven.ts, stack) ---
[
  "seven-runtime/workers/config/os.json",
  "seven-runtime/workers/core/routing.js",
  "seven-runtime/workers/core/sectors.js",
  "seven-runtime/seven.ts",
  "seven-runtime/stack/seven-stack.ts",
].forEach(item => {
  const src = path.join(ROOT, item);
  if (!fs.existsSync(src)) return;

  const base = path.basename(item);
  move(item, `seven-os/core/${base}`);
});

console.log("\n✅ Autosorter pass complete.\n");
