/**
 * © 2026 Global Infrastructure Advisory
 * Farmer Engine — Hub Logic
 */

const { mapLocationToContext } = require('../utilities/geo/mapping-logic');
const { runAI } = require('../ai/ai-worker');

module.exports.processFarmerInput = async function(farmerInput) {

  const locationContext = await mapLocationToContext({
    country: farmerInput.country,
    state: farmerInput.state,
    lat: farmerInput.lat,
    lon: farmerInput.lon
  });

  const aiPrompt = `
    Farmer Profile:
    - Herd Size: ${farmerInput.herdSize}
    - Breed: ${farmerInput.breed}
    - Grazing: ${farmerInput.grazing}
    - Feed: ${farmerInput.feed}
    - Water Access: ${farmerInput.water}
    - Market Goals: ${farmerInput.marketGoals}

    Location Context:
    - Country: ${locationContext.country}
    - Climate: ${locationContext.riskProfile.climate}
    - Drought Risk: ${locationContext.riskProfile.droughtRisk}
    - Programs: ${locationContext.programs.join(', ')}

    Generate a 12‑month operational plan.
  `;

  const aiOutput = await runAI(aiPrompt);

  return {
    plan: aiOutput,
    locationContext
  };
};
