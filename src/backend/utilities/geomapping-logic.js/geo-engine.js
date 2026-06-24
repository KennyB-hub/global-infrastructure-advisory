// geo-engine.js
// Global Infrastructure Advisory — Geo Mapping Engine (distance + nearby project search)

/**
 * Convert degrees to radians.
 * @param {number} deg
 * @returns {number}
 */
function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Calculate distance between two coordinates using Haversine formula.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @param {"miles"|"km"} unit
 * @returns {number} distance in given unit
 */
function calculateDistance(lat1, lon1, lat2, lon2, unit = "miles") {
  const R = unit === "miles" ? 3958.8 : 6371; // Earth radius
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find nearby projects around a user location.
 * Each project can define either radius_miles or radius_km.
 * @param {number} userLat
 * @param {number} userLon
 * @param {Array<Object>} projects
 * @returns {Array<Object>} projects with current_distance + unit
 */
function findNearbyProjects(userLat, userLon, projects) {
  const nearby = [];

  for (const p of projects) {
    const loc = p.location;
    const pLat = loc.lat;
    const pLon = loc.lon;

    const unit = loc.country.toLowerCase() === "usa" ? "miles" : "km";
    const dist = calculateDistance(userLat, userLon, pLat, pLon, unit);

    const limit =
      unit === "miles" ? p.radius_miles ?? null : p.radius_km ?? null;

    if (limit != null && dist <= limit) {
      nearby.push({
        ...p,
        current_distance: Number(dist.toFixed(2)),
        unit
      });
    }
  }

  return nearby;
}

// Example sample data (you can move this to a JSON file or DB)
const sampleProjects = [
  {
    id: "PROJ-TX-001",
    name: "Texas Agriculture Expansion",
    hub: "FarmerHub",
    location: {
      country: "usa",
      state: "Texas",
      lat: 31.9686,
      lon: -99.9018
    },
    status: "active",
    radius_miles: 50
  },
  {
    id: "PROJ-AF-002",
    name: "Donor-Funded Africa Infrastructure",
    hub: "ContractorHub",
    location: {
      country: "Kenya",
      state: "Nairobi",
      lat: -1.2863,
      lon: 36.8172
    },
    status: "pending",
    radius_km: 100
  }
];

// Example usage (remove or adapt in production)
function demo() {
  // User in Abilene, TX (approx 32.4, -99.7)
  const userLat = 32.4;
  const userLon = -99.7;

  const results = findNearbyProjects(userLat, userLon, sampleProjects);
  console.log("Nearby projects:", results);
}

// Uncomment to test locally
// demo();

module.exports = {
  calculateDistance,
  findNearbyProjects
};
