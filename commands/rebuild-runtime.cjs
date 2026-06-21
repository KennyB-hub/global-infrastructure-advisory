#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "seven-os", "global-manifest.json");
const RUNTIME_CACHE_PATH = path.join(ROOT, "seven-os", "seven-runtime", ".runtime-cache.json");
const ROUTING_REPORT_PATH = path.join(ROOT, "reports", "routing-report.json");

function safeReadJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; }
}

function main() {
  console.log("⚙️  Compiling Seven-Runtime from active system state reports...");

  const manifest = safeReadJSON(MANIFEST_PATH);
  if (!manifest) {
    console.error(`❌ Manifest missing at: ${MANIFEST_PATH}`);
    process.exit(1);
  }

  const report = safeReadJSON(ROUTING_REPORT_PATH);
  const unmappedCount = report && Array.isArray(report.unmappedFiles) ? report.unmappedFiles.length : 0;

  console.log(`📦 System Matrix Status:`);
  console.log(`   • Mapped Routes: ${Object.keys(manifest.routes || {}).length}`);
  console.log(`   • Unmapped Files Remaining: ${unmappedCount}`);

  const validRoutes = {};
  const invalidRoutes = [];

  for (const [routeKey, relativePath] of Object.entries(manifest.routes || {})) {
    const fullPath = path.join(ROOT, relativePath.replace(/\//g, path.sep));
    if (fs.existsSync(fullPath)) {
      validRoutes[routeKey] = relativePath.replace(/\\/g, "/");
    } else {
      invalidRoutes.push({ key: routeKey, path: relativePath });
    }
  }

  if (invalidRoutes.length > 0) {
    console.warn(`⚠️  Warning: ${invalidRoutes.length} broken mappings skipped by compiler.`);
  }

  const assembly = {
    compiledAt: new Date().toISOString(),
    sevenOS: {
      rootPath: ROOT,
      activeRoutes: validRoutes,
      unmappedCount
    }
  };

  if (!fs.existsSync(path.dirname(RUNTIME_CACHE_PATH))) {
    fs.mkdirSync(path.dirname(RUNTIME_CACHE_PATH), { recursive: true });
  }

  fs.writeFileSync(RUNTIME_CACHE_PATH, JSON.stringify(assembly, null, 2));
  console.log(`✅ System runtime cache safely generated at:\n   ${RUNTIME_CACHE_PATH}\n`);
}

main();
