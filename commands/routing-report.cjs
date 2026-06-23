#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Hardcoded root directory alignment for stability
const ROOT = path.resolve(__dirname, "..");

// Explicitly mapping your active manifest and target runtime layer paths
const MANIFEST_PATH = path.join(ROOT, "seven-os", "global-manifest.json");
const RUNTIME_CACHE_PATH = path.join(ROOT, "seven-runtime", ".runtime-cache.json");

function safeReadJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function main() {
  console.log("⚙️  Initializing Seven-Runtime Assembly Rebuild...");
  console.log(`📖 Reading Source Manifest: ${MANIFEST_PATH}`);

  // 1. Verify Manifest Target
  const manifest = safeReadJSON(MANIFEST_PATH);
  if (!manifest) {
    console.error(`❌ Runtime Build Failed: Cannot read manifest file at ${MANIFEST_PATH}`);
    process.exit(1);
  }

  const routes = manifest.routes || {};
  const engines = manifest.engines || {};
  const domains = manifest.domains || {};

  console.log(`📦 Loaded Manifest stats successfully:`);
  console.log(`   • ${Object.keys(routes).length} Application Routes`);
  console.log(`   • ${Object.keys(domains).length} Infrastructure Domains`);
  console.log(`   • ${Object.keys(engines).length} Runtime Engines`);

  // 2. Validate Physical Paths for every mapped route
  console.log("\n🔍 Verifying physical file states against Seven-OS mapping paths...");
  const invalidRoutes = [];
  const validRoutes = {};

  for (const [routeKey, relativePath] of Object.entries(routes)) {
    // Clean slash formats for cross-platform matching
    const normalizedPath = relativePath.replace(/\//g, path.sep).replace(/\\/g, path.sep);
    const fullPath = path.join(ROOT, normalizedPath);

    if (fs.existsSync(fullPath)) {
      validRoutes[routeKey] = relativePath.replace(/\\/g, "/"); 
    } else {
      invalidRoutes.push({ key: routeKey, path: relativePath });
    }
  }

  if (invalidRoutes.length > 0) {
    console.warn(`⚠️  Warning: ${invalidRoutes.length} broken route path(s) detected:`);
    invalidRoutes.forEach(r => console.warn(`   ❌ Missing file: ${r.key} -> ${r.path}`));
  }

  // 3. Compile the local Runtime Assembly state
  const runtimeStateAssembly = {
    compiledAt: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    sevenOS: {
      rootPath: ROOT,
      manifestVersion: manifest.version || "1.2.0",
      activeRoutes: validRoutes,
      activeEngines: engines,
      activeDomains: domains
    }
  };

  // 4. Ensure destination directory exists and write the cache payload
  const runtimeDir = path.dirname(RUNTIME_CACHE_PATH);
  if (!fs.existsSync(runtimeDir)) {
    fs.mkdirSync(runtimeDir, { recursive: true });
  }

  try {
    fs.writeFileSync(RUNTIME_CACHE_PATH, JSON.stringify(runtimeStateAssembly, null, 2));
    console.log(`\n✅ Seven-Runtime cache generated successfully!`);
    console.log(`💾 State committed to: ${RUNTIME_CACHE_PATH}\n`);
  } catch (err) {
    console.error("❌ Critical Error: Failed to write runtime cache file:", err.message);
    process.exit(1);
  }
}

main();
