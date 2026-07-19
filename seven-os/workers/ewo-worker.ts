// workers/ewo-worker.ts
// GIA EWO Gateway Worker – V12 Alpha (TypeScript)

import { handleEWORequest } from "../backend/system/ewo/ewo-router";
import { getTrustZone, checkTrust } from "../backend/system/trust-middleware";

import systemManifest from "../config/system-manifest.json";
import nodeRegistry from "../config/node-registry.json";

import { buildEvent } from "../system/cyber/event-builder";
import { cyberHook } from "../system/cyber/worker-hook";

// ---------------------------------------------------------
// Unified JSON Response
// ---------------------------------------------------------
function json(
  data: Record<string, any>,
  status: number = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "GIA-Platform-ID": systemManifest.platform_id,
      "GIA-Version": systemManifest.version,
      ...extraHeaders
    }
  });
}

// ---------------------------------------------------------
// Node Resolver (sector → physical cluster)
// ---------------------------------------------------------
function resolveNode(sector?: string) {
  if (!sector) return null;
  const s = String(sector).toUpperCase();
  return nodeRegistry.clusters.find(
    (c: any) => c.sector.toUpperCase() === s
  ) || null;
}

// ---------------------------------------------------------
// MAIN WORKER
// ---------------------------------------------------------
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Determine trust zone
    const trustZone = getTrustZone(path);

    // Cyber event for every request
    const event = buildEvent({
      source: "ewo-gateway",
      sector: "system",
      trustZone,
      type: "access_attempt",
      metadata: {
        path,
        method: request.method,
        ip: request.headers.get("cf-connecting-ip")
      }
    });

    // Cyber engine enforcement
    await cyberHook(event);

    // ---------------------------------------------------------
    // 1. EWO DISPATCH (PRIMARY)
    // ---------------------------------------------------------
    if (path === "/ewo/dispatch" && request.method === "POST") {
      try {
        const input = await request.json();
        input.trustZone = trustZone;

        // Resolve node based on sector
        const node = resolveNode(input.sector);

        // Trust enforcement
        if (!checkTrust(trustZone, request)) {
          return json(
            {
              ok: false,
              error: "Forbidden",
              trustZone,
              path
            },
            403
          );
        }

        // Execute EWO router
        const result = await handleEWORequest(input, env, ctx, node);

        return json({
          ok: true,
          trustZone,
          node: node?.name || null,
          result
        });
      } catch (err: any) {
        return json(
          {
            ok: false,
            error: "EWO Dispatch Failure",
            details: err.message,
            trustZone
          },
          500
        );
      }
    }

    // ---------------------------------------------------------
    // 2. EWO HEALTH CHECK
    // ---------------------------------------------------------
    if (path === "/ewo/health") {
      return json({
        ok: true,
        worker: "EWO-Gateway",
        version: systemManifest.version,
        platform: systemManifest.platform_id,
        trustZone
      });
    }

    // ---------------------------------------------------------
    // 3. FALLBACK
    // ---------------------------------------------------------
    return json(
      {
        ok: false,
        error: "Not Found",
        path,
        trustZone
      },
      404
    );
  }
};

