// autonomous/seven/core/zoning/zoning.js

import { getItemById, getSector } from "../mci/index.js";

/**
 * Zoning rules for Seven OS
 * These can be extended or replaced by governance policies in MCI.
 */
const ZONING_TABLE = [
  {
    id: "zone-rural",
    name: "Rural Infrastructure Zone",
    allowed: ["tower", "fiber", "water-pump", "solar-array"],
    restricted: ["datacenter"],
    coordinates: { latMin: 37, latMax: 40, lonMin: -83, lonMax: -80 }
  },
  {
    id: "zone-urban",
    name: "Urban Infrastructure Zone",
    allowed: ["datacenter", "fiber", "substation", "tower"],
    restricted: ["hydro-engine"],
    coordinates: { latMin: 38, latMax: 39, lonMin: -82, lonMax: -81 }
  },
  {
    id: "zone-space",
    name: "Orbital Zone",
    allowed: ["orbital-node", "satellite", "hydro-engine", "digital-dc"],
    restricted: ["tower"],
    orbit: ["LEO", "MEO", "GEO"]
  }
];

/**
 * Determine which zone a coordinate or orbital asset belongs to.
 */
export function classifyZone(asset) {
  // Space zoning
  if (asset.orbit_type) {
    return ZONING_TABLE.find(z => z.orbit?.includes(asset.orbit_type)) || null;
  }

  // Earth zoning
  const { lat, lon } = asset.coordinates || {};
  if (lat == null || lon == null) return null;

  return ZONING_TABLE.find(z =>
    lat >= z.coordinates.latMin &&
    lat <= z.coordinates.latMax &&
    lon >= z.coordinates.lonMin &&
    lon <= z.coordinates.lonMax
  ) || null;
}

/**
 * Check if an asset is allowed in its zone.
 */
export function validateZoning(assetId) {
  const result = getItemById(assetId);
  if (!result) return { allowed: false, reason: "Unknown asset" };

  const { item } = result;
  const zone = classifyZone(item);

  if (!zone) {
    return { allowed: false, reason: "No zoning match" };
  }

  if (zone.allowed.includes(item.type)) {
    return { allowed: true, zone: zone.id };
  }

  if (zone.restricted.includes(item.type)) {
    return { allowed: false, zone: zone.id, reason: "Restricted by zoning" };
  }

  return { allowed: false, zone: zone.id, reason: "Not listed in zoning rules" };
}

/**
 * CLI helper: explain zoning for an asset.
 */
export function explainZoning(assetId) {
  const check = validateZoning(assetId);

  if (!check.allowed) {
    return `Asset ${assetId} is NOT allowed in zone ${check.zone}: ${check.reason}`;
  }

  return `Asset ${assetId} is allowed in zone ${check.zone}`;
}
