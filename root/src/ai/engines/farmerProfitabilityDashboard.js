export const farmerProfitabilityDashboard = {
  version: "v1",
  purpose: "Give farmers a real-time view of profitability, risk, and market opportunities.",

  inputs: {
    herdData: "headCount, weightClass, species",
    feedCosts: "current + projected",
    winteringCosts: "region-specific",
    haulingCosts: "from hauler matching engine",
    marketForecasts: "from price forecasting engine",
    diseaseRisk: "from disease containment engine",
    corridorRisk: "from supply-chain-topology"
  },

  outputs: {
    netProfitPerHead: "real-time",
    projectedProfitPerHead: "30/90/180 days",
    bestMarket: "hub/feedlot/processor",
    bestSellWindow: "date range",
    riskWarnings: "disease, corridor, weather",
    costBreakdown: "feed, wintering, hauling, risk penalties"
  },

  logic: {
    step1: "Calculate current cost basis",
    step2: "Apply market forecasts",
    step3: "Apply risk penalties",
    step4: "Calculate net profit per head",
    step5: "Rank markets + timing windows"
  }
};
