#!/usr/bin/env node

/**
 * Seven‑OS Doctor — JSON Report Edition
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, "reports");
const REPORT_FILE = path.join(REPORT_DIR, "doctor-report.json");

if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR);

let report = {
  generated: new Date().toISOString(),
  checks: []
};

function addCheck(name, status, error = null) {
  report.checks.push({ name, status, error });
}

function check(name, fn) {
  try {
    fn();
    addCheck(name, "PASS");
  } catch (err) {
    addCheck(name, "FAIL", err.message);
  }
}

function requireDir(dir) {
  if (!fs.existsSync(path.join(ROOT, dir))) {
    throw new Error(`Missing directory: ${dir}`);
  }
}

function requireFile(file) {
  if (!fs.existsSync(path.join(ROOT, file))) {
    throw new Error(`Missing file: ${file}`);
  }
}

// --------------------------------------
// 1. Directory Structure
// --------------------------------------
check("Directory Structure", () => {
  ["src", "autonomous-os", "public", "scripts"].forEach(requireDir);
});

// --------------------------------------
// 2. Config Files
// --------------------------------------
check("Config Files", () => {
  ["package.json", "ecosystem.config.js", "wrangler.toml"].forEach(requireFile);
});

// --------------------------------------
// 3. TypeScript Syntax
// --------------------------------------
check("TypeScript Syntax", () => {
  execSync("npx tsc --noEmit", { stdio: "pipe" });
});

// --------------------------------------
// 4. Dependency Health
// --------------------------------------
check("Dependency Health", () => {
  execSync("npm ls --depth=0", { stdio: "pipe" });
});

// --------------------------------------
// 5. Circular Dependencies
// --------------------------------------
check("Circular Dependencies", () => {
  execSync("npx madge src --circular", { stdio: "pipe" });
});

// --------------------------------------
// 6. OS Logic Integrity
// --------------------------------------
check("OS Logic Integrity", () => {
  ["kernel.js", "runtime.js", "manifest.json", "routing.json"].forEach(f =>
    requireFile(`ai-os/${f}`)
  );
});

// --------------------------------------
// 7. Sector Mapping
// --------------------------------------
check("Sector Mapping", () => {
  const file = path.join(ROOT, "sector-worker-mapping.csv");
  if (!fs.existsSync(file)) throw new Error("Missing sector-worker-mapping.csv");

  const csv = fs.readFileSync(file, "utf8");
  if (!csv.includes(",")) throw new Error("Invalid CSV structure");
});

// --------------------------------------
// 8. JSON Validation
// --------------------------------------
check("JSON Validation", () => {
  const files = fs.readdirSync(ROOT).filter(f => f.endsWith(".json"));
  files.forEach(f => {
    JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8"));
  });
});

// --------------------------------------
// Write JSON Report
// --------------------------------------
fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

console.log("\n🔥 AI-OS Doctor JSON report generated:");
console.log(REPORT_FILE);
console.log("\nSummary:");
report.checks.forEach(c => {
  console.log(`${c.status === "PASS" ? "✔" : "❌"} ${c.name}`);
});
