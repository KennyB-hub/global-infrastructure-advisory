export const livestockMarketRoutingEngine = {
  version: "v1",
  purpose: "Route livestock to the best available market based on price, cost, risk, and farmer preferences.",

  inputs: {
    headCount: "number",
    weightClass: "e.g. '500-600lb'",
    species: "cattle | sheep | goats | etc.",
    farmerLocation: "regionId or lat/lon",
    marketData: "live/near-real-time prices by hub/feedlot/processor",
    transportCostModels: "fuel, distance, tolls, hauler rates",
    riskData: "region risk, corridor stability, disease alerts",
    farmerPreferences: "max distance, min price, preferred markets"
  },

  outputs: {
    bestMarket: "hubId | feedlotId | processorId",
    expectedNetPricePerHead: "after transport + fees",
    routePlan: "farmer → hub/feedlot/processor",
    haulerOptions: "ranked list",
    marketAlternatives: "backup markets with slightly lower scores"
  },

  scoringModel: {
    priceWeight: 0.45,
    transportCostWeight: 0.25,
    riskWeight: 0.20,
    preferenceWeight: 0.10
  },

  logic: {
    step1: "Pull candidate markets within radius/region",
    step2: "Estimate transport cost to each market",
    step3: "Apply risk penalties (disaster, war-zone, disease, corridor)",
    step4: "Compute net price per head (marketPrice - transportCost - riskPenalty)",
    step5: "Apply farmer preferences and rank markets",
    step6: "Return bestMarket + routePlan + haulerOptions"
  }
};
