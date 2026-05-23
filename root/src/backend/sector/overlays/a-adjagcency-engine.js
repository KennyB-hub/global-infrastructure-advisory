/**
 * © 2026 Global Infrastructure Advisory
 * Sector Mapping Logic + Sector Adjacency Engine
 */

const COUNTRY_PROFILES = { /* unchanged from previous version */ };

const PROJECT_REGISTRY = [ /* unchanged from previous version */ ];

/**
 * ⭐ Sector Adjacency Map
 * Defines which sectors are considered "related" or "transferable."
 */
const SECTOR_ADJACENCY = {
  agriculture: ["environment", "water", "logistics"],
  infrastructure: ["construction", "energy", "transportation", "water"],
  construction: ["infrastructure", "energy"],
  energy: ["infrastructure", "utilities", "renewables"],
  water: ["infrastructure", "environment"],
  environment: ["agriculture", "water"],
  logistics: ["transportation", "infrastructure"],
  transportation: ["logistics", "infrastructure"],
  renewables: ["energy", "infrastructure"],
  general: []
};

/**
 * ⭐ Score adjacency between two sectors
 * Returns:
 *   - score (100 exact, 80 adjacent, 40 unrelated)
 *   - reason (human-readable)
 */
function scoreSectorAdjacency(primary, target) {
  if (!primary || !target) {
    return { score: 100, reason: "No sector specified" };
  }

  const p = primary.toLowerCase();
  const t = target.toLowerCase();

  if (p === t) {
    return { score: 100, reason: "Primary sector aligns" };
  }

  const adjacent = SECTOR_ADJACENCY[t] || [];
  if (adjacent.includes(p)) {
    return { score: 80, reason: `Sector is adjacent to ${target}` };
  }

  return { score: 40, reason: "Sector not aligned or adjacent" };
}

/**
 * ⭐ Main Context Mapper
 * Adds:
 *   - primary sector
 *   - adjacency list
 *   - country profile
 */
function mapSectorContext(location) {
  const { country, state, lat, lon } = location;

  let context = {
    region: state || country,
    sector: "general",
    isAgricultural: false,
    isFederal: false,
    coordinates: { lat, lon },
    adjacentSectors: []
  };

  const agPriorityZones = ["Texas", "Iowa", "Kansas", "Nebraska", "California"];

  if (agPriorityZones.includes(state)) {
    context.sector = "agriculture";
    context.isAgricultural = true;
  }

  if (country?.toLowerCase() === "usa") {
    context.isFederal = true;
  }

  // ⭐ Attach country profile
  if (COUNTRY_PROFILES[country]) {
    context.countryProfile = COUNTRY_PROFILES[country];
  }

  // ⭐ Attach adjacency list
  context.adjacentSectors = SECTOR_ADJACENCY[context.sector] || [];

  return context;
}

module.exports = {
  mapSectorContext,
  COUNTRY_PROFILES,
  PROJECT_REGISTRY,
  SECTOR_ADJACENCY,
  scoreSectorAdjacency
};
