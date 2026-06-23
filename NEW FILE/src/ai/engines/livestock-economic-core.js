export const globalLivestockEconomicEngine = {
  version: "v1",
  purpose: "Compute real and projected economics for livestock across regions, markets, and time.",

  inputs: {
    herdData: "headCount, weightClass, species",
    costBasis: "feed, wintering, health, land, labor",
    haulingCosts: "from logistics/hauler engine",
    marketPrices: "from price forecasting engine",
    riskPenalties: "disease, corridor, disaster, war-zone",
    sustainabilitySignals: "carbon, water, land scores"
  },

  outputs: {
    netProfitPerHeadNow: "number",
    projectedNetProfitPerHead: "per time window",
    breakEvenPrice: "per head",
    bestMarketByNet: "marketId",
    sectorSignals: {
      transportDemand: "hauls needed",
      feedDemand: "feed volume",
      energyDemand: "cold storage, processing load",
      waterDemand: "regional livestock water load"
    }
  },

  logic: {
    step1: "Aggregate all costs into costBasisPerHead",
    step2: "Apply current and forecasted market prices",
    step3: "Subtract hauling + risk penalties",
    step4: "Compute netProfitPerHead and breakEvenPrice",
    step5: "Emit sectorSignals so other sectors can plan capacity"
  }
};
