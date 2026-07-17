/**
 * debug-worker.ts
 * ----------------
 * Transparent debugging Worker for GIA Deep Mind 2100.
 * No trust-zones, no governor, no policy filters.
 * Logs everything and returns raw AI engine output.
 */

// /workers/debug/debug-worker.ts
// GIA Sovereign Debug Worker – V12 Alpha
// Raw AI execution surface (no trust zones, no filters)

import { AI } from "../../../engines/global-ai-loader";

import systemManifest from "../../../config/system-manifest.json";
import nodeRegistry from "../../../config/node-registry.json";
import clusterHealth from "../../../config/cluster-health.json";

// ---------------------------------------------------------
// Unified JSON responder
// ---------------------------------------------------------
function json(
  data: Record<string, any>,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "GIA-Platform-ID": systemManifest.platform_id,
      "GIA-Version": systemManifest.version
    }
  });
}

// ---------------------------------------------------------
// MAIN DEBUG WORKER
// ---------------------------------------------------------
export default {
  async fetch(
    request: Request,
    env: any,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    //
    // 1. DEBUG METADATA
    //
    const debugInfo = {
      worker: "debug-worker",
      method: request.method,
      path: url.pathname,
      timestamp: new Date().toISOString(),
      cf: (request as any).cf || null,

      platform: {
        id: systemManifest.platform_id,
        version: systemManifest.version,
        failsafe: systemManifest.failsafe_level
      },

      nodes: nodeRegistry.clusters.map((c: any) => ({
        name: c.name,
        sector: c.sector,
        hostname: c.hostname,
        port: c.port,
        tls: c.tls
      })),

      clusters: clusterHealth.clusters.map((c: any) => ({
        name: c.name,
        sector: c.sector,
        status: c.status,
        health_score: c.health_score
      })),

      ai: {
        engineAvailable: typeof AI?.run === "function",
        binding: (AI as any)?.binding || "unknown"
      }
    };

    //
    // 2. GET → return debug metadata
    //
    if (request.method !== "POST") {
      return json({
        message: "Debug Worker online",
        instructions: "Send POST with JSON to test AI engine.",
        debug: debugInfo
      });
    }

    //
    // 3. Parse JSON
    //
    let payload: any;
    try {
      payload = await request.json();
    } catch (err: any) {
      return json(
        {
          error: "Invalid JSON body",
          details: err.message,
          debug: debugInfo
        },
        400
      );
    }

    //
    // 4. RAW AI EXECUTION (no trust zones, no filters)
    //
    let result: any;
    try {
      result = await AI.run(payload, env);
    } catch (err: any) {
      return json(
        {
          error: "AI engine threw an exception",
          details: err.message,
          stack: err.stack,
          payload,
          debug: debugInfo
        },
        500
      );
    }

    //
    // 5. Return raw engine output + sovereign debug metadata
    //
    return json({
      debug: debugInfo,
      payload,
      result
    });
  }
};
