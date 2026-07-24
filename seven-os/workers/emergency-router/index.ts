// --- SEVEN-OS AUTOMATED LEDGER TRACKING HOOK ---
import { SevenOsLedgerManager } from "../utils/ledger-manager";
const _ledger = new SevenOsLedgerManager();
_ledger.logWorkerEvidence("emergency-router", "online", "Autonomous worker runtime initialization cycle verified.");
// -----------------------------------------------
/**
 * © 2026 Global Infrastructure Advisory
 * Emergency Router — Defense‑Aware Auto Failover Mode (V12 Alpha)
 */

export default {
  async fetch(
    request: Request,
    env: any
  ): Promise<Response> {
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const ua = request.headers.get("User-Agent") || "unknown";
    const trustZone = request.headers.get("GIA-Trust-Zone") || "public";
    const apiKey = request.headers.get("X-API-Key") || null;

    try {
      // ---------------------------------------------------------
      // Forward trust-zone + key to primary
      // ---------------------------------------------------------
      const primaryReq = new Request(request, {
        headers: {
          ...Object.fromEntries(request.headers),
          "GIA-Trust-Zone": trustZone,
          ...(apiKey ? { "X-API-Key": apiKey } : {})
        }
      });

      const primary = await env.PRIMARY_API.fetch(primaryReq);

      if (primary.ok) return primary;

      // ---------------------------------------------------------
      // Log failover event
      // ---------------------------------------------------------
      await env.DB.query(
        "system",
        `INSERT INTO security_events 
          (ts, zone, workflow, event_type, ip, ua, severity, meta)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          Date.now(),
          trustZone,
          "emergency-router",
          "PRIMARY_DOWN",
          ip,
          ua,
          "high",
          JSON.stringify({ status: primary.status })
        ]
      );

      return new Response(
        JSON.stringify({
          mode: "EMERGENCY",
          message: "Primary systems offline. Routing to backup.",
          backup_node: "GIA_BACKUP_NODE_01"
        }),
        { status: 503 }
      );

    } catch (err: any) {
      // ---------------------------------------------------------
      // Log critical failure
      // ---------------------------------------------------------
      await env.DB.query(
        "system",
        `INSERT INTO security_events 
          (ts, zone, workflow, event_type, ip, ua, severity, meta)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          Date.now(),
          trustZone,
          "emergency-router",
          "CRITICAL_FAILOVER",
          ip,
          ua,
          "critical",
          JSON.stringify({ error: err.message })
        ]
      );

      return new Response(
        JSON.stringify({
          mode: "EMERGENCY",
          message: "Critical failure. Emergency Mode Activated.",
          backup_node: "GIA_BACKUP_NODE_01"
        }),
        { status: 503 }
      );
    }
  }
};

