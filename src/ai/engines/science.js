// Science Engine
// Farming, water testing, public safety, environmental reasoning scaffold.

export async function run(input) {
  const query = (input.query || "").toLowerCase();
  const intent = detectScienceIntent(query);

  return {
    type: "science_result",
    intent,
    result: await executeScienceLogic(intent, input)
  };
}

function detectScienceIntent(text) {
  if (text.includes("soil") || text.includes("crop")) return "agriculture";
  if (text.includes("water test") || text.includes("contamination") || text.includes("pfas")) return "water_testing";
  if (text.includes("air quality") || text.includes("pollution")) return "air_quality";
  if (text.includes("public safety") || text.includes("hazard")) return "public_safety";
  return "general_science";
}

async function executeScienceLogic(intent, input) {
  switch (intent) {
    case "agriculture":
      return {
        message: "Agriculture logic placeholder.",
        factors: ["soil", "rainfall", "temperature", "crop type"]
      };

    case "water_testing":
      return {
        message: "Water testing logic placeholder.",
        parameters: ["pH", "turbidity", "nitrates", "lead", "PFAS"]
      };

    case "air_quality":
      return {
        message: "Air quality logic placeholder.",
        metrics: ["PM2.5", "PM10", "O3", "NO2", "SO2"]
      };

    case "public_safety":
      return {
        message: "Public safety / hazard assessment placeholder.",
        domains: ["traffic", "infrastructure failure", "weather", "flooding"]
      };

    default:
      return {
        message: "General science / environment query.",
        query: input.query
      };
  }
}
