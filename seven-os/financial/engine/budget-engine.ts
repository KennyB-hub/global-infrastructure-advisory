export interface BudgetLineItem {
  id: string;
  label: string;
  allocated: number;
  actual: number;
  tags: string[];
}

export interface Budget {
  id: string;
  projectId: string;
  sector: string;
  totalBudget: number;
  currency: string;
  timeframe: {
    start: string;
    end: string;
  };
  lineItems: BudgetLineItem[];
  contractMeta: {
    samUei: string | null;
    naics: string[];
    psc: string[];
    fundingSource: string | null;
    contractId: string | null;
  };
}

export function calculateBudgetUsage(budget: Budget) {
  const totalAllocated = budget.lineItems.reduce(
    (sum, li) => sum + li.allocated,
    0
  );
  const totalActual = budget.lineItems.reduce(
    (sum, li) => sum + li.actual,
    0
  );

  return {
    totalAllocated,
    totalActual,
    remaining: budget.totalBudget - totalActual,
    allocationDelta: budget.totalBudget - totalAllocated,
    utilizationPercent:
      budget.totalBudget === 0
        ? 0
        : (totalActual / budget.totalBudget) * 100
  };
}
