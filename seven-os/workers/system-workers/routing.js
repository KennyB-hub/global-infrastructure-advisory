// /workers/routing.js
// GIA Sovereign Routing Spine – V12 Alpha

import { secure } from "backend/security/middleware.js";
import { protectedRoutes } from "./protected-routes.js";
import { adminEndpoints } from "./admin-endpoints.js";
import { Cortex } from "../../backend/ai/cortex.js";
import { runDecision } from "../../sector/shared/decision-engine.js";
import { EngineeringEngine } from "../../sector/construction/engineering-engine.js";
import { MechanicsEngine } from "../../sector/shared/mechanics-engine.js";

import systemManifest from "../../config/system-manifest.json" assert { type: "json" };
import nodeRegistry from "../config/node-registry.json" assert { type: "json" };

// ---------------------------------------------------------
// Utility: Unified JSON Response
// ---------------------------------------------------------
function json(data, status = 200, extraHeaders = {}) {
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
// Trust Zone Resolver
// ---------------------------------------------------------
function resolveTrustZone(pathname) {
  if (pathname.startsWith("/admin")) return "ADMIN";
  if (pathname.startsWith("/api/contractor")) return "CONTRACTOR";
  if (pathname.startsWith("/api/farmer")) return "FARMER";
  if (pathname.startsWith("/gov")) return "GOV";
  if (pathname.startsWith("/deepgov")) return "DEEPGOV";
  return "PUBLIC";
}

// ---------------------------------------------------------
// Node Resolver (sector → physical cluster)
// ---------------------------------------------------------
function resolveNode(sector) {
  if (!sector) return null;
  const s = String(sector).toUpperCase();
  return nodeRegistry.clusters.find(c => c.sector.toUpperCase() === s) || null;
}

// ---------------------------------------------------------
// Routing Map (for Inspector / Debug UI)
// ---------------------------------------------------------
const ROUTING_MAP = {
  "/heartbeat": "HEALTH",
  "/ai/process": "CORTEX",
  "/api/decision": "DECISION_ENGINE",
  "/admin/*": "ADMIN",
  "/api/*": "PROTECTED",
  "*": "PUBLIC"
};

// ---------------------------------------------------------
// MAIN ROUTER
// ---------------------------------------------------------
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const trustZone = resolveTrustZone(url.pathname);
    const engineeringEngine = new EngineeringEngine();
    const mechanicsEngine = new MechanicsEngine();

    // ---------------------------------------------------------
    // 1. HEALTH CHECK
    // ---------------------------------------------------------
    if (url.pathname === "/heartbeat") {
      return json({ ok: true, zone: trustZone, router: "V12-Alpha" });
    }

    // ---------------------------------------------------------
    // 2. AI CORTEX
    // ---------------------------------------------------------
    if (url.pathname === "/ai/process" && request.method === "POST") {
      try {
        const cortex = new Cortex(env);
        const input = await request.json();
        input.trustZone = trustZone;

        const result = await cortex.process(input);
        return json({ zone: trustZone, result });
      } catch (err) {
        return json({ error: "Cortex Failure", details: err.message }, 500);
      }
    }

    // ---------------------------------------------------------
    // 3. DECISION ENGINE
    // ---------------------------------------------------------
    if (url.pathname === "/api/decision" && request.method === "POST") {
      try {
        const input = await request.json();
        input.trustZone = trustZone;

        const node = resolveNode(input.sector);
        const result = await runDecision(input, env, node);

        return json(result);
      } catch (err) {
        return json({ error: "Decision Engine Failure", details: err.message }, 500);
      }
    }

    // ---------------------------------------------------------
    // 4. ADMIN ROUTES
    // ---------------------------------------------------------
    if (url.pathname.startsWith("/admin")) {
      return adminEndpoints(request, env, ctx);
    }

    // ---------------------------------------------------------
    // 5. PROTECTED ROUTES (secured by middleware)
    // ---------------------------------------------------------
    if (url.pathname.startsWith("/api")) {
      return secure(protectedRoutes)(request, env, ctx);
    }

    // ---------------------------------------------------------
    // 6. PUBLIC FALLBACK
    // ---------------------------------------------------------
    return json({
      message: "GIA Sovereign Router Online",
      version: systemManifest.version,
      platform: systemManifest.platform_id,
      trustZone,
      routingMap: ROUTING_MAP
    });
  }
};

// ---------------------------------------------------------
// SYSTEM: Engineering Report
// ---------------------------------------------------------
if (url.pathname === "/system/engineering-report" && request.method === "POST") {
  try {
    const body = await request.json();

    const input = {
      domain: body.domain,
      system: body.system,
      data: body.data || {},
      trustZone: "system",
      workflow: "engineering-analysis"
    };

    const report = await engineeringEngine.process(input, env, {
      trustZone: "system",
      workflow: "engineering-analysis"
    });

    return json(report);
  } catch (err) {
    return json({ error: "Engineering Engine Failure", details: err.message }, 500);
  }
}

// ---------------------------------------------------------
// SYSTEM: Mechanics Report
// ---------------------------------------------------------
if (url.pathname === "/system/mechanics-report" && request.method === "POST") {
  try {
    const body = await request.json();

    const input = {
      category: body.category,
      system: body.system,
      data: body.data || {},
      trustZone: "system",
      workflow: "mechanics-analysis"
    };

    const report = await mechanicsEngine.process(input, env, {
      trustZone: "system",
      workflow: "mechanics-analysis"
    });

    return json(report);
  } catch (err) {
    return json({ error: "Mechanics Engine Failure", details: err.message }, 500);
  }
}
