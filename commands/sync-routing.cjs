#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "seven-os", "global-manifest.json");
const ROUTING_REPORT_PATH = path.join(ROOT, "reports", "routing-report.json");
const ROUTING_STATE_PATH = path.join(ROOT, "reports", "routing-state.json");

function safeReadJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; }
}

function main() {
  console.log("🔄 Syncing routing state from scan reports...");

  const manifest = safeReadJSON(MANIFEST_PATH);
  if (!manifest) {
    console.error("❌ global-manifest.json missing or invalid.");
    process.exit(1);
  }
  manifest.routes = manifest.routes || {};

  const report = safeReadJSON(ROUTING_REPORT_PATH);
  let renameCount = 0;

  if (report && Array.isArray(report.unmappedFiles)) {
    console.log(`🔎 Checking ${report.unmappedFiles.length} unmapped files for specialized routing...`);

    for (const relativePath of report.unmappedFiles) {
      const fullPath = path.join(ROOT, relativePath);
      if (!fs.existsSync(fullPath)) continue;

      const fileContent = fs.readFileSync(fullPath, "utf8").toLowerCase();
      const dir = path.dirname(fullPath);
      const ext = path.extname(fullPath);
      const baseName = path.basename(fullPath, ext).toLowerCase();

      let newBaseName = null;

      // Pipeline Matching Logic
      if (baseName === "pipeline") {
        if (fileContent.includes("oil") || fileContent.includes("gas") || fileContent.includes("dot")) {
          newBaseName = "oil-gas-doh-pipeline";
        } else if (fileContent.includes("sector") || fileContent.includes("job") || fileContent.includes("workflow")) {
          newBaseName = "jobs-workflow-pipeline";
        }
      }

      // Transport Matching Logic
      if (baseName === "transport") {
        if (fileContent.includes("sat") || fileContent.includes("lte") || fileContent.includes("failover")) {
          newBaseName = "satellite-lte-failover-transport";
        } else if (fileContent.includes("sector") || fileContent.includes("connection") || fileContent.includes("data")) {
          newBaseName = "sector-connective-transport";
        }
      }

      if (newBaseName) {
        const newFileName = `${newBaseName}${ext}`;
        const newFullPath = path.join(dir, newFileName);
        const newRelativePath = path.relative(ROOT, newFullPath).replace(/\\/g, "/");

        try {
          fs.renameSync(fullPath, newFullPath);
          console.log(`  ✅ Synced & Renamed: ${relativePath} ➡️ ${newRelativePath}`);
          
          const routeKey = `infrastructure:${newBaseName}`;
          manifest.routes[routeKey] = newRelativePath;
          renameCount++;
        } catch (err) {
          console.error(`  ❌ Failed renaming path ${relativePath}:`, err.message);
        }
      }
    }
  }

  if (renameCount > 0) {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log(`💾 Saved updates into global-manifest.json.`);
  }

  // Save the synchronized state snapshot out to your reports folder
  const state = {
    timestamp: new Date().toISOString(),
    totalRoutes: Object.keys(manifest.routes).length,
    routes: manifest.routes,
  };

  if (!fs.existsSync(path.dirname(ROUTING_STATE_PATH))) {
    fs.mkdirSync(path.dirname(ROUTING_STATE_PATH), { recursive: true });
  }
  fs.writeFileSync(ROUTING_STATE_PATH, JSON.stringify(state, null, 2));
  console.log("✅ Routing state snapshot file updated.");
}

main();
