// backend/hubs-logic/farmer-engine.js

const { mapLocationToContext } = require('../../countries/data/mapping-logic');

module.exports.processFarmerInput = async function(farmerInput) {

  // 1. Map location to infrastructure context
  const locationContext = await mapLocationToContext({
    country: farmerInput.country,
    state: farmerInput.state,
    lat: farmerInput.lat,
    lon: farmerInput.lon
  });

  // 2. Build AI prompt
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

  // 3. Send to AI Worker
  const aiOutput = await runAI(aiPrompt);

  // 4. Return plan + resources
  return {
    plan: aiOutput,
    locationContext
  };
};
