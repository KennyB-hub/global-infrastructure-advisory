// /seven-os/sectors/sector-loader.js
// GIA Sovereign Sector Loader – V12 Alpha

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const manifestPath = path.join(__dirname, "..", "..", "proprietary-cli", "global-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

export function getEnabledSectors() {
  return (manifest.sectors || []).filter(s => s.enabled);
}

export function getSectorById(id) {
  if (!id) return null;
  return (manifest.sectors || []).find(s => s.id === id) || null;
}

export function listSectorIds() {
  return getEnabledSectors().map(s => s.id);
}

export function loadSectors() {
  return getEnabledSectors();
}

export function loadAllsectors() {
  return manifest.sectors || [];
}

// NEW: sector metadata for AI engines
export function getSectorMeta(id) {
  const sector = getSectorById(id);
  if (!sector) return null;

  return {
    id: sector.id,
    name: sector.name || sector.id,
    category: sector.category || "infrastructure",
    enabled: sector.enabled,
    dependencies: sector.dependencies || [],
    risk_profile: sector.risk_profile || "unknown"
  };
}
