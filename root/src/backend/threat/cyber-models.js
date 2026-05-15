export class CyberThreatModels {
  static assess(ctx) {
    if (ctx.sector?.name !== "cyber") {
      return {
        threatScore: 0,
        indicators: []
      };
    }

    const level = ctx.sector.context?.threatLevel || "unknown";
    const alerts = ctx.sector.context?.activeAlerts || [];

    let score = 0;
    if (level === "medium") score = 0.5;
    if (level === "high") score = 0.8;
    if (level === "critical") score = 1.0;

    if (alerts.length > 0) {
      score = Math.min(1, score + 0.1);
    }

    return {
      threatScore: score,
      indicators: alerts
    };
  }
}
