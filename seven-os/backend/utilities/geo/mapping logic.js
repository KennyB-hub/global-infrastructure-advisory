// backend/utilities/geo/mapping-logic.js

const fs = require('fs');
const path = require('path');
const { normalizeLocation } = require('../../countries/data/normalize-location');
const { calculateDistance } = require('./distance');
const { matchRegion } = require('./region-matcher');

module.exports = {

  /**
   * Main entry point:
   * Converts raw location input → full infrastructure context
   */
  mapLocationToContext: async function(locationInput) {
    const normalized = await normalizeLocation(locationInput);

    const countryData = await loadCountryData(normalized.country);
    const regionData = await matchRegion(normalized);

    return {
      ...normalized,
      countryData,
      regionData,
      riskProfile: buildRiskProfile(countryData, regionData),
      programs: buildProgramList(countryData, regionData),
    };
  },

  /**
   * Loads the correct country JSON file
   */
  loadCountryData: async function(countryCode) {
    const filePath = path.join(__dirname, '../../data/countries', `${countryCode}.json`);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  },

  /**
   * Builds a risk profile (climate, drought, flood, conflict, etc.)
   */
  buildRiskProfile: function(countryData, regionData) {
    return {
      climate: regionData.climate || countryData.climate,
      droughtRisk: regionData.droughtRisk || countryData.droughtRisk,
      floodRisk: regionData.floodRisk || countryData.floodRisk,
      conflictRisk: regionData.conflictRisk || countryData.conflictRisk,
    };
  },

  /**
   * Builds a list of relevant programs (USDA, USAID, World Bank, etc.)
   */
  buildProgramList: function(countryData, regionData) {
    return [
      ...countryData.programs,
      ...(regionData.programs || [])
    ];
  }
};
// Add this inside backend/utilities/geo/mapping-logic.js
const fs = require('fs').promises; // Use promises for Azure performance
const path = require('path');

async function loadCountryData(countryCode) {
    const filePath = path.join(__dirname, '../../data/countries', `${countryCode}.json`);
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Missing data for ${countryCode}`);
        return { programs: [] }; // Safe fallback
    }
}
