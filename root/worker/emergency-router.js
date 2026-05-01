/**
 * © 2026 Global Infrastructure Advisory
 * Emergency Router — Auto Failover Mode
 */

export default {
  async fetch(request, env) {
    try {
      const primary = await env.PRIMARY_API.fetch(request);
      if (primary.ok) return primary;

      return new Response(JSON.stringify({
        mode: "EMERGENCY",
        message: "Primary systems offline. Routing to backup.",
        backup_node: "GIA_BACKUP_NODE_01"
      }), { status: 503 });

    } catch {
      return new Response(JSON.stringify({
        mode: "EMERGENCY",
        message: "Critical failure. Emergency Mode Activated.",
        backup_node: "GIA_BACKUP_NODE_01"
      }), { status: 503 });
    }
  }
};
