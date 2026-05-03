/**
 * © 2026 Global Infrastructure Advisory
 * Unified Geo Mapping Engine
 */

const fs = require('fs').promises;
const path = require('path');
const { normalizeLocation } = require('./normalize-location');
const { matchRegion } = require('./region-matcher');
const { mapSectorContext } = require('./sector-mapping');

module.exports = {

  mapLocationToContext: async function(locationInput) {
    const normalized = await normalizeLocation(locationInput);

    const countryData = await loadCountryData(normalized.country);
    const regionData = await matchRegion(normalized);
    const sectorData = mapSectorContext(normalized);

    return {
      ...normalized,
      countryData,
      regionData,
      sectorData,
      riskProfile: buildRiskProfile(countryData, regionData),
      programs: buildProgramList(countryData, regionData),
    };
  }
};

async function loadCountryData(countryCode) {
  const filePath = path.join(__dirname, '../../data/countries', `${countryCode}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return { programs: [] };
  }
}

function buildRiskProfile(countryData, regionData) {
  return {
    climate: regionData.climate || countryData.climate,
    droughtRisk: regionData.droughtRisk || countryData.droughtRisk,
    floodRisk: regionData.floodRisk || countryData.floodRisk,
    conflictRisk: regionData.conflictRisk || countryData.conflictRisk,
  };
}

function buildProgramList(countryData, regionData) {
  return [
    ...countryData.programs,
    ...(regionData.programs || [])
  ];
}
