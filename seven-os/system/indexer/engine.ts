// seven-os/system/indexer/engine.ts
import fs from "fs";
import path from "path";
import { EngineKind, EngineDescriptor, GlobalManifest } from "./types";

//
// === 10-LAYER OS ROOTS ===
//
const ROOTS: Record<string, string[]> = {
  runtime:        ["runtime"],
  os_core:        [
    "seven-os/ai",
    "seven-os/core",
    "seven-os/system",
    "seven-os/drone",
    "seven-os/cattle",
    "seven-os/infra"
  ],
  domain:         ["domain"],
  api:            ["api"],
  utilities:      ["utilities"],
  workers:        ["seven-os/workers", "domain/infrastructure/workers"],
  dashboard:      ["utilities/dashboard/universal"],
  services:       ["seven-os/services"],
  interop:        ["interop"],
  intelligence:   ["intelligence"]
};

//
// === Sector detection ===
//
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
  "energy",
  "transport",
  "telecom",
  "space",
  "geo"
];

function detectSector(filePath: string): string | null {
  const lower = filePath.toLowerCase();
  for (const hint of SECTOR_HINTS) {
    if (lower.includes(hint)) return hint;
  }
  return null;
}

//
// === Engine kind mapping ===
//
function detectKind(section: string): EngineKind {
  switch (section) {
    case "runtime": return "runtime-engine";
    case "os_core": return "os-core-engine";
    case "domain": return "domain-engine";
    case "api": return "api-endpoint";
    case "utilities": return "utilities-engine";
    case "workers": return "worker-engine";
    case "dashboard": return "dashboard-engine";
    case "services": return "service-engine";
    case "interop": return "interop-engine";
    case "intelligence": return "intelligence-engine";
    default: return "os-core-engine";
  }
}

//
// === Walk directories ===
//
function walk(rootDir: string): string[] {
  const results: string[] = [];

  if (!fs.existsSync(rootDir)) return results;

  function visit(dir: string) {
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

  visit(rootDir);
  return results;
}

//
// === Build manifest ===
//
export function buildGlobalManifest(repoRoot: string): GlobalManifest {
  const manifest: GlobalManifest = {
    version: "2.0.0",
    generated_at: new Date().toISOString(),

    runtime: [],
    os_core: [],
    domain: [],
    api: [],
    utilities: [],
    workers: [],
    dashboard: [],
    services: [],
    interop: [],
    intelligence: []
  };

  for (const [section, roots] of Object.entries(ROOTS)) {
    const kind = detectKind(section);

    for (const root of roots) {
      const absRoot = path.join(repoRoot, root);
      const files = walk(absRoot);

      for (const file of files) {
        const rel = path.relative(repoRoot, file).replace(/\\/g, "/");
        const sector = detectSector(rel);

        const descriptor: EngineDescriptor = {
          id: rel.replace(/\.[tj]s$/, ""),
          name: path.basename(rel),
          kind,
          sector,
          path: rel,
          trustZone: "default",
          autonomyLevel: section === "runtime" ? 3 : 1
        };

        (manifest as any)[section].push(descriptor);
      }
    }
  }

  return manifest;
}

//
// === Write manifest ===
//
export function writeGlobalManifest(repoRoot: string) {
  const manifest = buildGlobalManifest(repoRoot);
  const outPath = path.join(repoRoot, "seven-os", "global-manifest.json");
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), "utf8");
}
