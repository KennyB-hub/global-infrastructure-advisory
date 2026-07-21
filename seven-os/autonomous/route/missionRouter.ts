import { evaluateMissionPhoenixFunding, applyPhoenixActuals } from "../../backend/trust/engine.js";

type Mission = {
  id: string;
  type: string;
  sector: string;
  region: string;
  costProfile: { estimatedCost: number; lineItemId?: string };
};

type RoutedMission = Mission & {
  funding: {
    phoenix: {
      fundingAmount: number;
      programEligibility: boolean;
      costOffset: number;
      lineItemId: string | null;
    };
  };
};

export function routeMissionWithPhoenix(mission: Mission): RoutedMission {
  const phoenix = evaluateMissionPhoenixFunding({
    missionType: mission.type,
    sector: mission.sector,
    costProfile: mission.costProfile,
    region: mission.region
  });

  if (phoenix.programEligibility && phoenix.lineItemId) {
    applyPhoenixActuals(phoenix.lineItemId, phoenix.fundingAmount);
  }

  return {
    ...mission,
    funding: {
      phoenix
    }
  };
}
