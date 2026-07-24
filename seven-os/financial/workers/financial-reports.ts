import { Budget, calculateBudgetUsage } from "./budgetEngine";

export async function getBudgetReport(budget: Budget) {
  const usage = calculateBudgetUsage(budget);

  return {
    id: budget.id,
    projectId: budget.projectId,
    sector: budget.sector,
    currency: budget.currency,
    timeframe: budget.timeframe,
    usage,
    contractMeta: budget.contractMeta
  };
}
