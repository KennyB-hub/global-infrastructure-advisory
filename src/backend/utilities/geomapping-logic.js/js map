/**
 * geo-mapping-logic.js
 * Bridges coordinates to Hub-specific contexts (Farmer, Contractor, etc.)
 */

function mapLocationToContext(location) {
    const { country, state, lat, lon } = location;
    
    // 1. Initialize the base context
    let context = {
        region: state || country,
        sector: 'general',
        isAgricultural: false,
        isFederal: false,
        coordinates: { lat, lon }
    };

    // 2. Sector-Specific Logic for FarmerHub (AgricultureHub)
    // Matches states with high agricultural priority
    const agPriorityZones = ['Texas', 'Iowa', 'Kansas', 'Nebraska', 'California'];
    if (agPriorityZones.includes(state)) {
        context.sector = 'agriculture';
        context.isAgricultural = true;
    }

    // 3. Federal Logic for Public Website/Procurement
    if (country && country.toLowerCase() === 'usa') {
        context.isFederal = true;
    }

    // 4. Return to the calling function (like FarmerHub or ContractorHub)
    return context;
}

module.exports = { mapLocationToContext };

// Add this inside backend/utilities/geo/mapping-logic.js
const fs = require('fs').promises; // mapLocationToContext Use promises for Azure performance
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

/**
 * © 2026 Global Infrastructure Advisory
 * Sector Mapping Logic
 */

function mapSectorContext(location) {
  const { country, state, lat, lon } = location;

  let context = {
    region: state || country,
    sector: 'general',
    isAgricultural: false,
    isFederal: false,
    coordinates: { lat, lon }
  };

  const agPriorityZones = ['Texas', 'Iowa', 'Kansas', 'Nebraska', 'California'];

  if (agPriorityZones.includes(state)) {
    context.sector = 'agriculture';
    context.isAgricultural = true;
  }

  if (country && country.toLowerCase() === 'usa') {
    context.isFederal = true;
  }

  return context;
}

module.exports = { mapSectorContext };
