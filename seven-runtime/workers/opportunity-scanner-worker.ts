import contracts from "../financial/contracts/contract.json";
import sectors from "../sectors/index.json";
import workers from "./index.json";

export async function opportunityScanner(query) {
  switch (query.type) {
    case "match_by_naics":
      return matchByNaics(query.naics);
    case "match_by_sector":
      return matchBySector(query.sector);
    case "match_by_role":
      return matchByRole(query.role);
    case "match_by_phase":
      return matchByMissionPhase(query.phase);
    default:
      return { error: "Unknown opportunity scan type" };
  }
}

function matchByNaics(naics) {
  return contracts.filter(c => c.naics.includes(naics));
}

function matchBySector(sector) {
  return contracts.filter(c => c.missionPhoenix.sectors.includes(sector));
}

function matchByRole(role) {
  return workers.filter(w => w.roles.includes(role));
}

function matchByMissionPhase(phase) {
  return contracts.filter(c => c.missionPhoenix.phase === phase);
}
