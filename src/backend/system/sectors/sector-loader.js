// GIA Sector Loader
// Loads sector definitions from global-manifest.json

import manifest from "../../../sectors/global-manifest.json";

export function getEnabledSectors() {
  return manifest.sectors.filter(s => s.enabled);
}

export function getSectorById(id) {
  return manifest.sectors.find(s => s.id === id) || null;
}

export function listSectorIds() {
  return getEnabledSectors().map(s => s.id);
}
