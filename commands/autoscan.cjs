#!/usr/bin/env node
// Seven‑OS Sector‑Aware Autoscan & Organizer (Hardened ESM Edition)
// Scans repo and automatically groups files into sectors/subsystems based on keywords.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const SECTORS = {
  agriculture: { keywords: ["cattle", "livestock", "collar", "hauler", "load", "pasture", "farm", "ranch"], base: "seven-os/agriculture" },
  airports: { keywords: ["airport", "aviation", "runway", "faa"], base: "seven-os/airports" },
  climate: { keywords: ["climate", "weather", "carbon", "emissions"], base: "seven-os/climate" },
  cloud: { keywords: ["cloud", "compute", "azure", "vm", "container"], base: "seven-os/cloud" },
  cyber: { keywords: ["cyber", "security", "auth", "entra", "key", "audit"], base: "seven-os/cyber" },
  contractors: { keywords: ["contractor", "workforce", "labor"], base: "seven-os/contractors" },
  datacenters: { keywords: ["datacenter", "cooling", "rack", "server"], base: "seven-os/datacenters" },
  disaster_response: { keywords: ["disaster", "rescue", "evacuation", "incident"], base: "seven-os/disaster-response" },
  government: { keywords: ["gov", "policy", "regulation"], base: "seven-os/government" },
  logistics: { keywords: ["logistics", "supply", "freight", "shipment"], base: "seven-os/logistics" },
  mining: { keywords: ["mining", "ore", "extraction"], base: "seven-os/mining" },
  pipelines: { keywords: ["pipeline", "flow", "oil", "gas"], base: "seven-os/pipelines" },
  ports: { keywords: ["port", "maritime", "dock"], base: "seven-os/ports" },
  public_safety: { keywords: ["safety", "hazard", "incident"], base: "seven-os/public-safety" },
  rail: { keywords: ["rail", "train", "track"], base: "seven-os/rail" },
  roads: { keywords: ["road", "highway", "bridge"], base: "seven-os/roads" },
  telecom: { keywords: ["telecom", "fiber", "5g", "tower"], base: "seven-os/telecom" },
  water: { keywords: ["water", "treatment", "pump"], base: "seven-os/water" },
  economics: { keywords: ["economics", "market", "price", "forecast"], base: "seven-os/economics" },
  financial: { keywords: ["finance", "bank", "credit"], base: "seven-os/financial" },
  fcc: { keywords: ["fcc", "spectrum", "broadcast", "signal"], base: "seven-os/fcc" }
};

function listFiles(dir, debugMode = false) {
  const out = [];
  function walk(d) {
    const folder = d.toLowerCase();
    if (!debugMode) {
      if (folder.includes("node_modules") || folder.includes(".git") || folder.includes("dist")) return;
    }
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      const lower = full.toLowerCase();
      if (!debugMode) {
        if (lower.includes("node_modules") || lower.includes(".git") || lower.includes("dist")) continue;
      }
      if (e.isDirectory()) walk(full);
      else if (e.isFile()) out.push(full);
    }
  }
  walk(dir);
  return out;
}

function classify(relative) {
  const lower = relative.toLowerCase();
  
  if (lower.startsWith("runtime/logs/") && lower.endsWith(".json")) {
    return { type: "runtime-log", target: "runtime/logs", sector: null };
  }
  if (lower.startsWith("runtime/") && lower.endsWith(".js")) {
    return { type: "runtime", target: "runtime", sector: null };
  }
  if (lower.includes("dashboard") || lower.includes("command-dashboard")) {
    return { type: "dashboard", target: "utilities/dashboard", sector: null };
  }
  for (const [sector, cfg] of Object.entries(SECTORS)) {
    if (cfg.keywords.some(k => lower.includes(k))) {
      return { type: "sector", sector, target: cfg.base };
    }
  }
  return { type: "unknown", target: null, sector: null };
}

async function run() {
  const debugMode = process.argv.includes("debug");
  const enforceMove = process.argv.includes("-move"); // Custom physical enforcer switch

  const files = listFiles(ROOT, debugMode)
    .map(f => path.relative(ROOT, f).replace(/\\/g, "/"));

  const groups = { runtime: [], "runtime-log": [], dashboard: [], sector: [], unknown: [] };

  for (const rel of files) {
    const c = classify(rel);
    groups[c.type].push({ file: rel, target: c.target, sector: c.sector });
  }

  console.log("==================================================");
  console.log("📂   SEVEN-OS AUTOSCAN TOPOLOGY REPORT            ");
  console.log("==================================================");
  console.log("Enforce Physical Move Actions:", enforceMove ? "ACTIVE" : "DISABLED (Simulation Mode)");
  console.log("--------------------------------------------------\n");

  // Physically relocate files back into place if -move is specified
  let filesMovedCount = 0;
  
  for (const [type, fileEntries] of Object.entries(groups)) {
    for (const entry of fileEntries) {
      if (enforceMove && entry.target && entry.file.dirname === ".") {
        const sourcePath = path.join(ROOT, entry.file);
        const destinationFolder = path.join(ROOT, entry.target);
        const destinationPath = path.join(destinationFolder, path.basename(entry.file));

        if (fs.existsSync(sourcePath)) {
          if (!fs.existsSync(destinationFolder)) {
            fs.mkdirSync(destinationFolder, { recursive: true });
          }
          fs.renameSync(sourcePath, destinationPath);
          console.log(`🔀 [Auto-Organized]: ${entry.file} ➔ ${entry.target}/${path.basename(entry.file)}`);
          filesMovedCount++;
        }
      }
    }
  }

  console.log(`\nScan complete. ${filesMovedCount} scattered files physically returned to their directories.`);

  // Safe ESM stub for your reporting logic
  try {
    const reportPath = path.join(ROOT, "seven-os", "system-sync-report.json");
    fs.writeFileSync(reportPath, JSON.stringify({ syncedAt: new Date().toISOString(), groups }, null, 2));
    console.log("✔ Topology report generated inside seven-os/system-sync-report.json");
  } catch (e) {
    console.log("⚠ Report logging skipped.");
  }
}

run().catch(console.error);
