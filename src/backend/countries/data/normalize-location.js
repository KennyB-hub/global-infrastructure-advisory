/**
 * © 2026 Global Infrastructure Advisory
 * Normalize Location Utility
 */

module.exports.normalizeLocation = async function(input) {
  return {
    country: input.country?.toLowerCase(),
    state: input.state || null,
    lat: input.lat || null,
    lon: input.lon || null,
  };
};
