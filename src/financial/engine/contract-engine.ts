export interface Contract {
  id: string;
  title: string;
  samUei: string | null;
  naics: string[];
  psc: string[];
  fundingSource: string;
  agency: {
    name: string;
    subAgency?: string;
    office?: string;
  };
  contractType: string;
  setAside?: string;
  competition?: string;
  ceilingAmount: number;
  basePeriod: {
    start: string;
    end: string;
  };
  optionPeriods: {
    id: string;
    start: string;
    end: string;
    ceilingAmount: number;
  }[];
  placeOfPerformance: {
    country: string;
    state?: string;
    city?: string;
    global?: boolean;
  };
  missionPhoenix: {
    phase: "stabilize" | "recover" | "rebuild";
    sectors: string[];
    priority: "low" | "medium" | "high";
  };
  compliance: {
    farClauses: string[];
    dfarsClauses: string[];
    cyberRequirements: string[];
    reporting: string[];
  };
  linkedBudgets: string[];
}

export function getTotalCeiling(contract: Contract) {
  const optionsTotal = contract.optionPeriods.reduce(
    (sum, p) => sum + p.ceilingAmount,
    0
  );
  return contract.ceilingAmount + optionsTotal;
}
