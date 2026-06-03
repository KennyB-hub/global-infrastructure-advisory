export function detectBridgeHazards(data) {
  const hazards = [];

  const usda = data.usda?.data || {};

  if (usda.bridgeStress === "high") {
    hazards.push({
      type: "bridge_stress",
      severity: "critical",
      message: "Bridge stress indicators elevated."
    });
  }

  return hazards;
}
