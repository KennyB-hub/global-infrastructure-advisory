export class CloudPolicies {
  static apply(ctx, result) {
    if (ctx.sector?.name !== "cloud") return result;

    const updated = { ...result };
    const risk = ctx.sector.context?.outageRisk || "low";
    const latency = ctx.sector.context?.latency ?? null;

    if (risk === "high") {
      updated.warnings = [
        ...updated.warnings,
        "Cloud region at high outage risk — prefer failover or read-only operations"
      ];
    }

    if (latency !== null && latency > 250) {
      updated.warnings = [
        ...updated.warnings,
        "High latency to cloud region — performance may be degraded"
      ];
    }

    return updated;
  }
}
