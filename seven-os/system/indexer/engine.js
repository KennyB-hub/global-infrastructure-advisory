// seven-os/system/indexer/engine.js
import fs from "fs";
import path from "path";

const ROOTS = [
  "seven-os",
  "seven-runtime",
  "backend",
  "api"
];

const SECTOR_HINTS = [
  "economics",
  "infrastructure",
  "intelligence",
  "financial",
  "cyber",
  "cloud",
  "agriculture",
  "inspection",
  "emergency",
  "contractor",
];

function detectKind(filePath) {
  if (filePath.includes("seven-os/mci/")) return "data";
  if (filePath.includes("seven-runtime/workers/")) return "runtime-worker";
  if (filePath.includes("seven-runtime/dashboards/")) return "dashboard";
  if (filePath.includes("seven-runtime/api/")) return "api";
  if (filePath.includes("seven-runtime/voice/")) return "voice";
  return "os-engine";
}

function detectSector(filePath) {
  const lower = filePath.toLowerCase();
  for (const hint of SECTOR_HINTS) {
    if (lower.includes(hint)) return hint;
  }
  return null;
}

function makeId(filePath) {
  return filePath
    .replace(/\\/g, "/")
    .replace(/\.[tj]s$/, "")
    .replace(/[^a-zA-Z0-9/_-]/g, "_");
}

function walk(root) {
  const results = [];
  function visit(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(full);
      } else if (entry.isFile()) {
        if (/\.(ts|js)$/.test(entry.name)) {
          results.push(full);
        }
      }
    }
  }
  if (fs.existsSync(root)) visit(root);
  return results;
}

export function buildGlobalManifest(repoRoot) {
  const engines = [];

  for (const root of ROOTS) {
    const absRoot = path.join(repoRoot, root);
    const files = walk(absRoot);

    for (const file of files) {
      const rel = path.relative(repoRoot, file).replace(/\\/g, "/");

      const kind = detectKind(rel);
      const sector = detectSector(rel);
      const id = makeId(rel);

      engines.push({
        id,
        name: path.basename(rel),
        kind,
        sector,
        path: rel,
        trustZone: "default",
        autonomyLevel: kind === "os-engine" ? 3 : 1,
      });
    }
  }

  return {
    version: "1.0.0",
    generated_at: new Date().toISOString(),
    engines,
  };
}

export function writeGlobalManifest(repoRoot) {
  const manifest = buildGlobalManifest(repoRoot);
  const outPath = path.join(repoRoot, "seven-os", "global-manifest.json");
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), "utf8");
}
