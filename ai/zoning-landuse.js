// seven-os/ai/zoning-landuse.js

import { getItemById } from "../seven-os/mci/index.js";

/**
 * Base zoning + land use table.
 * Later you can move this into MCI.governance.rules for dynamic control.
 */
const ZONES = [
  {
    id: "zone-rural",
    name: "Rural Infrastructure Zone",
    coordinates: { latMin: 37, latMax: 40, lonMin: -83, lonMax: -80 },
    allowed_types: ["tower", "fiber", "water-pump", "solar-array"],
    restricted_types: ["datacenter"],
    land_use: ["agriculture", "utility", "low-density"]
  },
  {
    id: "zone-urban",
    name: "Urban Infrastructure Zone",
    coordinates: { latMin: 38, latMax: 39, lonMin: -82, lonMax: -81 },
    allowed_types: ["datacenter", "fiber", "substation", "tower"],
    restricted_types: ["hydro-engine"],
    land_use: ["commercial", "industrial", "high-density"]
  },
  {
    id: "zone-space",
    name: "Orbital Zone",
    orbit: ["LEO", "MEO", "GEO"],
    allowed_types: ["orbital-node", "satellite", "hydro-engine", "digital-dc"],
    restricted_types: ["tower"],
    land_use: ["orbital-lane", "resource-extraction", "relay"]
  }
];

/**
 * Classify an asset into a zone (Earth or orbit).
 */
export function classifyZone(asset) {
  // Space / orbital zoning
  if (asset.orbit_type) {
    return (
      ZONES.find(z => z.orbit && z.orbit.includes(asset.orbit_type)) || null
    );
  }

  // Earth zoning
  const coords = asset.coordinates || {};
  const { lat, lon } = coords;
  if (lat == null || lon == null) return null;

  return (
    ZONES.find(z => {
      const c = z.coordinates;
      return (
        c &&
        lat >= c.latMin &&
        lat <= c.latMax &&
        lon >= c.lonMin &&
        lon <= c.lonMax
      );
    }) || null
  );
}

/**
 * Determine land use profile for a zone.
 */
export function getLandUseForZone(zoneId) {
  const zone = ZONES.find(z => z.id === zoneId);
  if (!zone) return [];
  return zone.land_use || [];
}

/**
 * Validate if an asset type is allowed in its zone + land use.
 */
export function validateZoningAndLandUse(assetId) {
  const result = getItemById(assetId);
  if (!result) {
    return { allowed: false, reason: "Unknown asset", zone: null, land_use: [] };
  }

  const { item } = result;
  const zone = classifyZone(item);

  if (!zone) {
    return {
      allowed: false,
      reason: "No zoning match",
      zone: null,
      land_use: []
    };
  }

  const landUse = getLandUseForZone(zone.id);

  if (zone.allowed_types.includes(item.type)) {
    return {
      allowed: true,
      reason: "Allowed by zoning",
      zone: zone.id,
      land_use: landUse
    };
  }

  if (zone.restricted_types.includes(item.type)) {
    return {
      allowed: false,
      reason: "Restricted by zoning",
      zone: zone.id,
      land_use: landUse
    };
  }

  return {
    allowed: false,
    reason: "Not listed in zoning rules",
    zone: zone.id,
    land_use: landUse
  };
}

/**
 * Human-readable explanation for CLI / logs.
 */
export function explainZoningAndLandUse(assetId) {
  const check = validateZoningAndLandUse(assetId);

  if (!check.zone) {
    return `Asset ${assetId}: no zoning match (${check.reason})`;
  }

  const lu = check.land_use.length ? check.land_use.join(", ") : "none";

  if (!check.allowed) {
    return `Asset ${assetId} is NOT allowed in zone ${check.zone} (land use: ${lu}): ${check.reason}`;
  }

  return `Asset ${assetId} is allowed in zone ${check.zone} (land use: ${lu})`;
}
