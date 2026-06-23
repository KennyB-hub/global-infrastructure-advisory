// backend/utilities/geo/normalize-location.js

const { mapLocationToContext, calculateDistance } = require('../utilities/geo');
module.exports.normalizeLocation = async function(input) {
  return {
    country: input.country?.toLowerCase(),
    state: input.state || null,
    lat: input.lat || null,
    lon: input.lon || null,
  };
};
