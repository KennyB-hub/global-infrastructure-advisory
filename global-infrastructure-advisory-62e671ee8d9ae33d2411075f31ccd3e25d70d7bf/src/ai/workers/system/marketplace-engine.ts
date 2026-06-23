import contracts from "../../financial/contracts/contract.json" assert { type: "json" };
import budgets from "../../financial/models/budgets.json" assert { type: "json" };
import workers from "../index.json" assert { type: "json" };

export async function getMarketplaceSnapshot(params: { sector?: string; phase?: string }) {
  const { sector, phase } = params;

  const filteredContracts = contracts.filter(c => {
    const sectorMatch = sector ? c.missionPhoenix.sectors.includes(sector) : true;
    const phaseMatch = phase ? c.missionPhoenix.phase === phase : true;
    return sectorMatch && phaseMatch;
  });

  const contractIds = filteredContracts.map(c => c.id);
  const relatedBudgets = budgets.filter(b =>
    contractIds.some(id => b.contractMeta?.contractId === id)
  );

  return {
    contracts: filteredContracts,
    budgets: relatedBudgets,
    workerRoles: workers.workers.map(w => ({ id: w.id, roles: w.roles }))
  };
}
