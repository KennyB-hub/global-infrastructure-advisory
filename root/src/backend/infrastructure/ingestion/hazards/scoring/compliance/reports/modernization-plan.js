export function generateModernizationPlan(data, hazards, score) {
  return {
    priority: score < 50 ? "high" : score < 75 ? "medium" : "low",
    recommendedUpgrades: hazards.map(h => ({
      hazard: h.type,
      severity: h.severity,
      action: `Mitigate ${h.type}`
    })),
    justification: "Modernization required based on hazard profile and score.",
    timeline: {
      start: null,
      end: null
    }
  };
}
