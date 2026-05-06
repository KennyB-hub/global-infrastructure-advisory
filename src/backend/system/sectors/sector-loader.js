// /src/ai-engine/sector/sector-loader.js
// GIA Sovereign Sector Loader – V12 Alpha

import manifest from "../../../sectors/global-manifest.json" assert { type: "json" };

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
