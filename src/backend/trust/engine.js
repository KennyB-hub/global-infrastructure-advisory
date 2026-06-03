export class TrustZoneEngine {
  static classify(ctx) {
    const base =
      ctx.environment?.trustZone ||
      ctx.sector?.trustZone ||
      "public";

    let zone = base;
    const reasons = [];

    if (ctx.sector?.name === "cyber") {
      const level = ctx.sector.context?.threatLevel || "unknown";
      if (level === "high" || level === "critical") {
        zone = "restricted";
        reasons.push(`Cyber threat level=${level}`);
      }
    }

    if (ctx.sector?.name === "cloud") {
      const risk = ctx.sector.context?.outageRisk || "low";
      if (risk === "high") {
        zone = "restricted";
        reasons.push("Cloud outage risk=high");
      }
    }

    if (zone === base && reasons.length === 0) {
      reasons.push(`Base trust zone=${base}`);
    }

    return {
      zone,
      reason: reasons.join("; ")
    };
  }
}
