// src/ai/tools/ag-tools.js
// Agriculture Tools — calculators, estimators, and field utilities.

export const agTools = {
  soilPHRecommendation,
  irrigationNeed,
  plantingWindow,
  livestockFeedCalculator,
  pesticideMixCalculator
};

// --- Soil pH Recommendation ---
function soilPHRecommendation(crop) {
  const ranges = {
    corn: [5.8, 7.0],
    soybeans: [6.0, 7.0],
    wheat: [6.0, 7.5],
    alfalfa: [6.5, 7.5],
    potatoes: [5.0, 6.0]
  };

  return ranges[crop.toLowerCase()] || [6.0, 7.0];
}

// --- Irrigation Need (simple ET model) ---
function irrigationNeed(soilMoisture, evapotranspiration) {
  return Math.max(0, evapotranspiration - soilMoisture);
}

// --- Planting Window (placeholder) ---
function plantingWindow(region, crop) {
  return {
    region,
    crop,
    recommendedStart: "Based on frost dates",
    recommendedEnd: "Based on soil temperature"
  };
}

// --- Livestock Feed Calculator ---
function livestockFeedCalculator(weight, species = "cattle") {
  const rates = {
    cattle: 0.025,
    sheep: 0.03,
    goats: 0.03,
    hogs: 0.04
  };

  const rate = rates[species.toLowerCase()] || 0.025;
  return weight * rate;
}

// --- Pesticide Mix Calculator ---
function pesticideMixCalculator(areaAcres, ratePerAcre) {
  return areaAcres * ratePerAcre;
}
