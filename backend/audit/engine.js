export class AuditEngine {
  static build(ctx, extra = {}) {
    return {
      confidence: AuditEngine.estimateConfidence(ctx),
      dataSources: ["GII", "GeoLogicV12", "SectorOverlays", "PolicyEngine"],
      policyApplied: extra.policyIds || [],
      version: "v12-alpha",
      ...extra
    };
  }

  static estimateConfidence(ctx) {
    let score = 1.0;

    if (ctx.location.regionId === "UNKNOWN_REGION") {
      score -= 0.3;
    }

    if (!ctx.sector?.context) {
      score -= 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }
}
