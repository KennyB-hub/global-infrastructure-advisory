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
  console.log("⚡ [Seven-OS Core] Running Master Multi-Sector Routing Sync...");

  const manifest = safeReadJSON(MANIFEST_PATH);
  if (!manifest) {
    console.error("❌ global-manifest.json missing or invalid.");
    process.exit(1);
  }
  manifest.routes = manifest.routes || {};

  const report = safeReadJSON(ROUTING_REPORT_PATH);
  let renameCount = 0;

  if (report && Array.isArray(report.unmappedFiles)) {
    console.log(`📡 Analyzing ${report.unmappedFiles.length} unmapped tracks for all critical sectors...`);

    for (const relativePath of report.unmappedFiles) {
      const fullPath = path.join(ROOT, relativePath);
      if (!fs.existsSync(fullPath)) continue;

      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) continue;

      const dir = path.dirname(fullPath).toLowerCase();
      const ext = path.extname(fullPath).toLowerCase();
      const baseName = path.basename(fullPath, ext).toLowerCase();

      // Ensure we only process source/configuration files
      if (![".js", ".cjs", ".ts", ".json"].includes(ext)) continue;

      let sectorPrefix = null;
      let specializedName = null;

      // =========================================================================
      // SECTOR 1: COMMS & TELECOM (FCC, Satellites, LTE, Failovers)
      // Target Folders: 'telecom', 'fcc', 'comms', 'satellite', 'connectivity'
      // =========================================================================
      if (dir.includes("telecom") || dir.includes("fcc") || dir.includes("comms") || dir.includes("satellite")) {
        sectorPrefix = "telecom";
        if (baseName.includes("transport")) {
          specializedName = "satellite-lte-failover-transport";
        } else if (baseName.includes("pipeline")) {
          specializedName = "telecom-data-pipeline";
        }
      }

      // =========================================================================
      // SECTOR 2: ROADS & TRANSIT (DOT, Roads, Vehicles, Infrastructure)
      // Target Folders: 'road', 'dot', 'transit', 'highway', 'transportation'
      // =========================================================================
      else if (dir.includes("road") || dir.includes("dot") || dir.includes("transit") || dir.includes("highway")) {
        sectorPrefix = "transit";
        if (baseName.includes("transport")) {
          specializedName = "doh-roads-transit-transport";
        } else if (baseName.includes("pipeline")) {
          specializedName = "dot-infrastructure-pipeline";
        }
      }

      // =========================================================================
      // SECTOR 3: ENERGY & GRID (Oil & Gas Pipelines, Utility Infrastructure)
      // Target Folders: 'grid', 'industrial', 'energy', 'utility', 'gas'
      // =========================================================================
      else if (dir.includes("grid") || dir.includes("industrial") || dir.includes("energy") || dir.includes("gas")) {
        sectorPrefix = "energy";
        if (baseName.includes("pipeline")) {
          specializedName = "oil-gas-grid-pipeline";
        } else if (baseName.includes("transport")) {
          specializedName = "utility-fuel-distribution-transport";
        }
      }

      // =========================================================================
      // SECTOR 4: APPLICATION WORKFLOWS (App Core, Jobs, Internal Engines)
      // Target Folders: 'app', 'workflow', 'services', 'backend', 'core'
      // =========================================================================
      else if (dir.includes("app") || dir.includes("workflow") || dir.includes("services") || dir.includes("core")) {
        sectorPrefix = "application";
        if (baseName.includes("pipeline")) {
          specializedName = "jobs-workflow-pipeline";
        } else if (baseName.includes("transport")) {
          specializedName = "sector-connective-transport";
        }
      }

                  // =========================================================================
      // SECTOR 5: AVIONICS & TELEMETRY (Drones, Voice Control, Flight Signals)
      // =========================================================================
      else if (dir.includes("drone") || dir.includes("avionics") || dir.includes("voice") || dir.includes("telemetry")) {
        sectorPrefix = "avionics";
        
        if (baseName.includes("pipeline") || baseName.includes("stream")) {
          specializedName = "flight-telemetry-pipeline";
        } else if (dir.includes("voice")) {
          // FIXED: Prevents namespace collisions by prefixing the unique base identity
          specializedName = `drone-voice-${baseName}`;
        } else {
          specializedName = `uas-${baseName}`;
        }
      }

      // =========================================================================
      // SECTOR 6: VISUALIZATION LAYERS (Hologram Engines, UI Dashboards, Renderers)
      // Target Folders: 'hologram', 'spatial', 'dashboard', 'ui', 'rendering'
      // =========================================================================
      else if (dir.includes("hologram") || dir.includes("spatial") || dir.includes("dashboard") || dir.includes("ui")) {
        sectorPrefix = "visualization";
        if (baseName.includes("hologram") || baseName.includes("projection")) {
          specializedName = "spatial-holographic-projection-engine";
        } else if (baseName.includes("dashboard") || baseName.includes("panel")) {
          specializedName = "ui-infrastructure-dashboard";
        } else {
          specializedName = `render-${baseName}`;
        }
      }

      // =========================================================================
      // SECTOR 7: BACKEND ENGINE & SYSTEM SYNC ORCHESTRATION
      // Target Folders: 'backend', 'orchestrator', 'sync-orchestrator', 'server'
      // =========================================================================
      else if (dir.includes("backend") || dir.includes("server")) {
        sectorPrefix = "backend";
        
        if (baseName.includes("orchestrator") || baseName.includes("sync")) {
          specializedName = `engine-sync-${baseName}`;
        } else {
          specializedName = `core-${baseName}`;
        }
      }

      // =========================================================================
      // SECTOR 8: UTILITIES & SYSTEM INFRASTRUCTURE DISCOVERY
      // Target Folder: 'sectors/utilities' (Cleans up the old autosorter mix)
      // =========================================================================
      else if (dir.includes("sectors/utilities") || dir.includes("sectors\\utilities")) {
        // Default to infrastructure, but dynamically specialize based on name or text content
        sectorPrefix = "infrastructure";
        
        if (baseName.includes("pipeline") || fileContent.includes("workforce") || fileContent.includes("job")) {
          sectorPrefix = "application";
          specializedName = "jobs-workflow-pipeline";
        } else if (baseName.includes("transport") || fileContent.includes("sat") || fileContent.includes("lte")) {
          sectorPrefix = "telecom";
          specializedName = "satellite-lte-failover-transport";
        } else if (fileContent.includes("oil") || fileContent.includes("gas") || fileContent.includes("grid")) {
          sectorPrefix = "energy";
          specializedName = "oil-gas-grid-pipeline";
        } else {
          // Keep its unique filename but prefix it cleanly to prevent it from getting lost
          specializedName = `utility-${baseName}`;
        }
      }

      // =========================================================================
      // PROCESSING & ROUTING MATRIX LOCK-IN
      // =========================================================================
      if (sectorPrefix && specializedName) {
        const newFileName = `${specializedName}${ext}`;
        const newFullPath = path.join(path.dirname(fullPath), newFileName);
        const newRelativePath = path.relative(ROOT, newFullPath).replace(/\\/g, "/");

        const routeKey = `${sectorPrefix}:${specializedName}`;

        // Rename file physically on your system if needed
        if (fullPath !== newFullPath) {
          try {
            fs.renameSync(fullPath, newFullPath);
            console.log(`  [${sectorPrefix.toUpperCase()} LOCK] Renamed: ${relativePath} ➡️ ${newRelativePath}`);
          } catch (err) {
            console.error(`  ❌ Failed sector rename for ${relativePath}:`, err.message);
            continue;
          }
        }

        // Write route into the core global-manifest map
        if (manifest.routes[routeKey] !== newRelativePath) {
          manifest.routes[routeKey] = newRelativePath;
          renameCount++;
        }
      }
    }
  }

  // Save the manifest transformations back to disk
  if (renameCount > 0) {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log(`💾 Saved ${renameCount} system sector tracks into global-manifest.json.`);
  } else {
    console.log("ℹ️ All active file layouts perfectly aligned with sector restrictions.");
  }

  // Generate clean state metrics report
  const state = {
    timestamp: new Date().toISOString(),
    totalRoutes: Object.keys(manifest.routes).length,
    routes: manifest.routes,
  };

  if (!fs.existsSync(path.dirname(ROUTING_STATE_PATH))) {
    fs.mkdirSync(path.dirname(ROUTING_STATE_PATH), { recursive: true });
  }
  fs.writeFileSync(ROUTING_STATE_PATH, JSON.stringify(state, null, 2));
  console.log("✅ Multi-sector routing state snapshot updated.");
}

main();
