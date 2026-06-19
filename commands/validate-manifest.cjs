#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "seven-os", "manifest.json");
const { writeReport } = require("../utilities/write-report.cjs");

function safeReadJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function main() {
  console.log("🔍 Validating manifest.json…");

  const manifest = safeReadJSON(MANIFEST_PATH);
  if (!manifest) {
    console.error("❌ manifest.json missing or invalid.");
    process.exit(1);
  }

  const errors = [];
  const routes = manifest.routes || {};

  // Basic shape checks
  if (typeof manifest !== "object") {
    errors.push("Manifest must be an object.");
  }

  if (!manifest.version) {
    errors.push("Manifest must have a 'version' field.");
  }

  // Route sanity
  for (const [key, value] of Object.entries(routes)) {
    if (typeof key !== "string" || !key.trim()) {
      errors.push(`Route key invalid: "${key}"`);
    }
    if (typeof value !== "string" || !value.trim()) {
      errors.push(`Route value invalid for key "${key}": "${value}"`);
    }
  }

  if (errors.length) {
    console.log("❌ Manifest validation failed:");
    for (const e of errors) console.log("   • " + e);
    process.exit(1);
  }

  console.log("✅ Manifest is structurally valid.");
}

main();
