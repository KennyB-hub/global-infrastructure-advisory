export function detectRoadHazards(data) {
  const hazards = [];

  const dot = data.dot?.data || {};

  if (dot.pavementCondition === "poor") {
    hazards.push({
      type: "pavement_failure",
      severity: "high",
      message: "Pavement condition rated poor by DOT."
    });
  }

  if (dot.shoulderWidth < 2) {
    hazards.push({
      type: "shoulder_narrow",
      severity: "critical",
      message: "Shoulder width below rural safety minimum."
    });
  }

  if (dot.crashClusters?.length > 0) {
    hazards.push({
      type: "crash_cluster",
      severity: "high",
      message: "Crash clusters detected along corridor."
    });
  }

  return hazards;
}
