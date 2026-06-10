import sectors from "../sectors/index.json" assert { type: "json" };
import workers from "../index.json" assert { type: "json" };
import contracts from "../../financial/contracts/contract.json" assert { type: "json" };

export function matchBySector(sectorId: string) {
  const sector = sectors.sectors.find((s: any) => s.id === sectorId);
  if (!sector) return { error: "Sector not found", sectorId };

  const sectorWorkers = workers.workers.filter((w: any) =>
    w.roles.includes(sectorId) || w.roles.includes(sector.type)
  );

  const sectorContracts = contracts.filter((c: any) =>
    c.missionPhoenix.sectors.includes(sectorId)
  );

  return {
    sector,
    workers: sectorWorkers,
    contracts: sectorContracts
  };
}
