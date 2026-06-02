export class RoutingEngine {
  static evaluate(ctx) {
    const isNet =
      ctx.sector?.name === "network" ||
      ctx.sector?.name === "telecom";

    if (!isNet) {
      return {
        routeHealth: "unknown",
        dnsIntegrity: "unknown",
        asn: ctx.sector?.asn || null
      };
    }

    const routeHealth = ctx.sector.context?.routeHealth || "unknown";
    const dnsIntegrity = ctx.sector.context?.dnsIntegrity || "unknown";
    const asn = ctx.sector?.asn || null;

    return {
      routeHealth,
      dnsIntegrity,
      asn
    };
  }
}
