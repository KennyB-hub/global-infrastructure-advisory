import budgets from "../../financial/models/budgets.json";
import contracts from "../../financial/contracts/contract.json";
import costModels from "../../financial/models/index.json";

export async function govView(query) {
  switch (query.type) {
    case "contract_overview":
      return getContractOverview(query.contractId);
    case "budget_rollup":
      return getBudgetRollup(query.contractId);
    case "sector_funding":
      return getSectorFunding(query.sector);
    case "mission_phoenix_status":
      return getMissionPhoenixStatus(query.phase);
    default:
      return { error: "Unknown gov view query" };
  }
}

function getContractOverview(contractId) {
  const contract = contracts.find(c => c.id === contractId);
  if (!contract) return { error: "Contract not found" };

  return {
    id: contract.id,
    title: contract.title,
    agency: contract.agency,
    ceiling: contract.ceilingAmount,
    totalCeiling: contract.ceilingAmount + contract.optionPeriods.reduce((s, p) => s + p.ceilingAmount, 0),
    naics: contract.naics,
    psc: contract.psc,
    missionPhoenix: contract.missionPhoenix
  };
}

function getBudgetRollup(contractId) {
  const contract = contracts.find(c => c.id === contractId);
  if (!contract) return { error: "Contract not found" };

  const linked = budgets.filter(b => contract.linkedBudgets.includes(b.id));

  const rollup = linked.map(b => ({
    id: b.id,
    sector: b.sector,
    allocated: b.lineItems.reduce((s, li) => s + li.allocated, 0),
    actual: b.lineItems.reduce((s, li) => s + li.actual, 0),
    remaining: b.totalBudget - b.lineItems.reduce((s, li) => s + li.actual, 0)
  }));

  return { contractId, rollup };
}

function getSectorFunding(sector) {
  const sectorBudgets = budgets.filter(b => b.sector === sector);
  return sectorBudgets.map(b => ({
    id: b.id,
    allocated: b.lineItems.reduce((s, li) => s + li.allocated, 0),
    actual: b.lineItems.reduce((s, li) => s + li.actual, 0)
  }));
}

function getMissionPhoenixStatus(phase) {
  const relatedContracts = contracts.filter(c => c.missionPhoenix.phase === phase);
  return relatedContracts.map(c => ({
    id: c.id,
    title: c.title,
    sectors: c.missionPhoenix.sectors,
    priority: c.missionPhoenix.priority
  }));
}
