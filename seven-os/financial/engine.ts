import fs from "node:fs";
import path from "node:path";

type FinancialModel = {
  id: string;
  name: string;
  engine: string;
  description: string;
  inputs: string[];
  outputs: string[];
};

type PhoenixBudgetLineItem = {
  id: string;
  label: string;
  allocated: number;
  actual: number;
  tags: string[];
};

type PhoenixBudget = {
  id: string;
  projectId: string;
  sector: string;
  currency: string;
  totalBudget: number;
  timeframe: { start: string; end: string };
  lineItems: PhoenixBudgetLineItem[];
  contractMeta: {
    samUei: string | null;
    naics: string[];
    psc: string[];
    fundingSource: string;
    contractId: string | null;
  };
};

type PhoenixFundingRequest = {
  missionType: string;
  sector: string;
  costProfile: { estimatedCost: number; lineItemId?: string };
  region: string;
};

type PhoenixFundingResult = {
  fundingAmount: number;
  programEligibility: boolean;
  costOffset: number;
  lineItemId: string | null;
};

const MODELS_PATH = path.join(process.cwd(), "seven-os", "financial", "models", "index.json");
const PHOENIX_BUDGET_PATH = path.join(
  process.cwd(),
  "seven-os",
  "financial",
  "budgets",
  "mission-phoenix.json"
);

let modelsCache: FinancialModel[] | null = null;
let phoenixBudgetCache: PhoenixBudget | null = null;

function loadModels(): FinancialModel[] {
  if (modelsCache) return modelsCache;
  const raw = fs.readFileSync(MODELS_PATH, "utf8");
  const json = JSON.parse(raw);
  modelsCache = json.models as FinancialModel[];
  return modelsCache!;
}

function loadPhoenixBudget(): PhoenixBudget {
  if (phoenixBudgetCache) return phoenixBudgetCache;
  const raw = fs.readFileSync(PHOENIX_BUDGET_PATH, "utf8");
  phoenixBudgetCache = JSON.parse(raw) as PhoenixBudget;
  return phoenixBudgetCache!;
}

export function getFinancialModels(): FinancialModel[] {
  return loadModels();
}

export function getPhoenixBudget(): PhoenixBudget {
  return loadPhoenixBudget();
}

export function evaluateMissionPhoenixFunding(
  req: PhoenixFundingRequest
): PhoenixFundingResult {
  const budget = loadPhoenixBudget();

  // pick line item either by explicit id or sector tags
  let targetLine: PhoenixBudgetLineItem | undefined;

  if (req.costProfile.lineItemId) {
    targetLine = budget.lineItems.find(li => li.id === req.costProfile.lineItemId);
  }

  if (!targetLine) {
    const sectorTag = req.sector.toLowerCase();
    targetLine = budget.lineItems.find(li =>
      li.tags.some(t => t.toLowerCase().includes(sectorTag))
    );
  }

  if (!targetLine) {
    return {
      fundingAmount: 0,
      programEligibility: false,
      costOffset: 0,
      lineItemId: null
    };
  }

  const remaining = targetLine.allocated - targetLine.actual;
  const requested = req.costProfile.estimatedCost;

  const fundingAmount = Math.min(remaining, requested);
  const programEligibility = fundingAmount > 0;
  const costOffset = fundingAmount;

  return {
    fundingAmount,
    programEligibility,
    costOffset,
    lineItemId: targetLine.id
  };
}

export function applyPhoenixActuals(lineItemId: string, amount: number): void {
  const budget = loadPhoenixBudget();
  const target = budget.lineItems.find(li => li.id === lineItemId);
  if (!target) return;

  target.actual += amount;

  fs.writeFileSync(PHOENIX_BUDGET_PATH, JSON.stringify(budget, null, 2), "utf8");
}
