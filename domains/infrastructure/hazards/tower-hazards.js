export function detectTowerHazards(data) {
  const hazards = [];

  const fcc = data.fcc?.data || {};

  if (fcc.backhaulStatus === "degraded") {
    hazards.push({
      type: "backhaul_issue",
      severity: "high",
      message: "Tower backhaul degraded."
    });
  }

  if (fcc.signalQuality < 40) {
    hazards.push({
      type: "signal_low",
      severity: "medium",
      message: "Signal quality below recommended threshold."
    });
  }

  return hazards;
}
