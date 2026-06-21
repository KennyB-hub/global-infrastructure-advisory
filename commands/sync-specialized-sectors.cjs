#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "seven-os", "global-manifest.json");
const REPORT_PATH = path.join(ROOT, "reports", "routing-report.json");

function safeReadJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function main() {
  console.log("🔄 Starting Specialized Sector Sync & Renaming...");

  // 1. Load the routing report to find unmapped files
  const report = safeReadJSON(REPORT_PATH);
  if (!report || !report.unmappedFiles) {
    console.error("❌ No routing-report.json found. Please run 'npm run routing:report' first.");
    process.exit(1);
  }

  // 2. Load the global manifest to update routes
  const manifest = safeReadJSON(MANIFEST_PATH);
  if (!manifest) {
    console.error("❌ No global-manifest.json found.");
    process.exit(1);
  }
  manifest.routes = manifest.routes || {};

  let updatedCount = 0;

  // 3. Process unmapped files
  for (const relativePath of report.unmappedFiles) {
    const fullPath = path.join(ROOT, relativePath);
    if (!fs.existsSync(fullPath)) continue;

    const fileContent = fs.readFileSync(fullPath, "utf8");
    const dir = path.dirname(fullPath);
    const ext = path.extname(fullPath);
    const baseName = path.basename(fullPath, ext);

    let newBaseName = null;

    // Logic for Pipeline files
    if (baseName === "pipeline") {
      if (fileContent.includes("oil") || fileContent.includes("gas") || fileContent.includes("dot")) {
        newBaseName = "oil-gas-doh-pipeline";
      } else if (fileContent.includes("sector") || fileContent.includes("job") || fileContent.includes("workflow")) {
        newBaseName = "jobs-workflow-pipeline";
      }
    }

    // Logic for Transport files
    if (baseName === "transport") {
      if (fileContent.includes("sat") || fileContent.includes("lte") || fileContent.includes("failover")) {
        newBaseName = "satellite-lte-failover-transport";
      } else if (fileContent.includes("sector") || fileContent.includes("connection") || fileContent.includes("data")) {
        newBaseName = "sector-connective-transport";
      }
    }

    // 4. If a match was found, rename the file and map it in the manifest
    if (newBaseName) {
      const newFileName = `${newBaseName}${ext}`;
      const newFullPath = path.join(dir, newFileName);
      const newRelativePath = path.relative(ROOT, newFullPath);

      // Physical rename
      fs.renameSync(fullPath, newFullPath);
      console.log(`✅ Renamed: ${relativePath} ➡️ ${newRelativePath}`);

      // Map to manifest using a clean domain routing key
      const routeKey = `infrastructure:${newBaseName}`;
      manifest.routes[routeKey] = newRelativePath.replace(/\\/g, "/"); // Normalize to Unix slashes for the OS
      updatedCount++;
    }
  }

  // 5. Save the updated manifest if changes were made
  if (updatedCount > 0) {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log(`💾 Manifest updated successfully with ${updatedCount} new specialized routes.`);
  } else {
    console.log("ℹ️ No conflicting pipeline or transport files required renaming in this pass.");
  }
}

main();
