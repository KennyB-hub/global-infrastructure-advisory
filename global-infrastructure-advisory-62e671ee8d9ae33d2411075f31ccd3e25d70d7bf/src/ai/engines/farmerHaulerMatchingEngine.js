export const farmerHaulerMatchingEngine = {
  version: "v1",
  purpose: "Match farmers with the best available livestock hauler globally.",

  inputs: {
    farmerLocation: "lat/lon or regionId",
    headCount: "number",
    species: "cattle | sheep | goats | bison | camels",
    haulerProfiles: "from contractor-topology",
    hubTopology: "livestock-hub-topology",
    corridorStatus: "supply-chain-topology"
  },

  outputs: {
    bestHauler: "haulerId",
    backupHaulers: "array",
    pickupHub: "hubId",
    estimatedCost: "USD or local currency",
    estimatedTime: "hours"
  },

  scoring: {
    distanceWeight: 0.25,
    capacityWeight: 0.25,
    safetyWeight: 0.20,
    corridorWeight: 0.15,
    regionRiskWeight: 0.15
  },

  logic: {
    step1: "Find nearest livestock hub",
    step2: "Filter haulers by species + capacity",
    step3: "Score haulers by distance + safety + region risk",
    step4: "Score corridors by stability",
    step5: "Return top match + backups"
  }
};
