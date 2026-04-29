// backend/hubs-logic/space-engine.js

const { mapLocationToContext } = require('../utilities/geo/mapping-logic');

module.exports.processSpaceInput = async function(spaceInput) {
const { runAI } = require('../ai/ai-worker');

  const locationContext = await mapLocationToContext({
    country: spaceInput.country,
    lat: spaceInput.lat,
    lon: spaceInput.lon
  });

  const aiPrompt = `
    Space Infrastructure Profile:
    - Facility Type: ${spaceInput.facilityType}
    - Launch Frequency: ${spaceInput.launchFrequency}
    - Payload Type: ${spaceInput.payloadType}

    Location Context:
    - Regulatory Environment: ${locationContext.countryData.regulations.space}
    - Climate: ${locationContext.riskProfile.climate}
    - Programs: ${locationContext.programs.join(', ')}

    Generate a compliance + operations plan.
  `;

  return await runAI(aiPrompt);
};

