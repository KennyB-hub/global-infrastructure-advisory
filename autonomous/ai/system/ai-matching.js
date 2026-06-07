// 2050 V12 Alpha — AI Matching Engine

const SECTOR_ADJACENCY = {
  infrastructure: ["construction", "transportation", "energy", "water"],
  construction: ["infrastructure", "energy"],
  energy: ["infrastructure", "construction"],
  water: ["infrastructure"]
};

export function runMatchingEngine(task) {
  const { candidate, opportunity } = task;

  const c = candidate.sector.toLowerCase();
  const o = opportunity.sector.toLowerCase();

  let score = 40;
  let reason = "Low Alignment";

  if (c === o) {
    score = 100;
    reason = "Primary Match";
  } else if (SECTOR_ADJACENCY[o]?.includes(c)) {
    score = 80;
    reason = "Adjacent";
  }

  return {
    ok: true,
    score,
    reason,
    candidateSector: c,
    opportunitySector: o
  };
}
