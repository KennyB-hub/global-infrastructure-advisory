export function scoreSector(data, hazards) {
  let score = 100;

  for (const hazard of hazards) {
    if (hazard.severity === "critical") score -= 40;
    if (hazard.severity === "high") score -= 25;
    if (hazard.severity === "medium") score -= 10;
    if (hazard.severity === "low") score -= 5;
  }

  if (score < 0) score = 0;

  return score;
}
