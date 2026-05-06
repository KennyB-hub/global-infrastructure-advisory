// GIA Sovereign Gateway Worker – V12 Alpha
// Routes: Hubs, Contractors, Deep Mind, System Endpoints, Decision Engine

import { runDecision } from "../../src/engine/decision-engine.js";
import { systemStatus } from "../../src/system/system-endpoints.js";
import { diagnostics } from "../../src/system/diagnostics.js";
import { uptime } from "../../src/system/uptime.js";
import { fullReport } from "../../src/system/full-report.js";
import { systemThreatReport } from "../../src/system/threat-report.js";
import { runCloudflareDiagnostics } from "../../src/system/cloudflare-tests.js";

import systemManifest from "../../src/config/system-manifest.json" assert { type: "json" };
import nodeRegistry from "../../src/config/node-registry.json" assert { type: "json" };

let START_TIME = Date.now();

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
// Utility: Trust Zone Resolver
// ---------------------------------------------------------
function resolveTrustZone(pathname) {
  if (pathname.startsWith("/hubs/contractor")) return "CONTRACTOR";
  if (pathname.startsWith("/hubs/farmer")) return "FARMER";
  if (pathname.startsWith("/gov")) return "GOV";
  if (pathname.startsWith("/deepgov")) return "DEEPGOV";
  return "PUBLIC";
}

// ---------------------------------------------------------
// Utility: Node Resolver (based on sector)
// ---------------------------------------------------------
function resolveNode(sector) {
  if (!sector) return null;
  const s = String(sector).toUpperCase();
  return nodeRegistry.clusters.find(c => c.sector.toUpperCase() === s) || null;
}

// ---------------------------------------------------------
// MAIN WORKER
// ---------------------------------------------------------
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const trustZone = resolveTrustZone(url.pathname);

    // ---------------------------------------------------------
    // 1. ROUTING: Redirect to Hubs
    // ---------------------------------------------------------
    if (url.pathname.startsWith("/hubs/contractor")) {
      return Response.redirect("https://pages.dev", 301);
    }

    // ---------------------------------------------------------
    // 2. API: Fetch Contractors from D1
    // ---------------------------------------------------------
    if (url.pathname === "/api/contractors") {
      try {
        const { results } = await env.DB.prepare("SELECT * FROM contractors").all();
        return json({ results });
      } catch (err) {
        return json({ error: "D1 Engine Stall", details: err.message }, 500);
      }
    }

    // ---------------------------------------------------------
    // 3. AI: Deep Mind Bridge
    // ---------------------------------------------------------
    if (request.method === "POST" && url.pathname === "/api/deep-mind") {
      try {
        const { query } = await request.json();

        const aiResponse = await env.AI.run("@cf/google/gemma-4-26b-a4b-it", {
          prompt: `GIA System Intelligence Query: ${query}`,
          max_tokens: 512
        });

        return json({
          trustZone,
          result: aiResponse.response,
          node: "DEEP-MIND-CORE"
        });
      } catch (err) {
        return json(
          { result: "Satellite sweep failed: Deep Mind offline.", error: err.message },
          500
        );
      }
    }

    // ---------------------------------------------------------
    // 4. DECISION ENGINE
    // ---------------------------------------------------------
    if (request.method === "POST" && url.pathname === "/api/decision") {
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
    // 5. SYSTEM ENDPOINTS
    // ---------------------------------------------------------

    // 5A — Status
    if (url.pathname === "/system/status") {
      return json(systemStatus(systemManifest));
    }

    // 5B — Diagnostics
    if (url.pathname === "/system/diagnostics") {
      return json(diagnostics(env.AI));
    }

    // 5C — Uptime
    if (url.pathname === "/system/uptime") {
      return json(uptime(START_TIME));
    }

    // 5D — Full Report
    if (url.pathname === "/system/full-report") {
      return json(fullReport(systemManifest, env.AI, START_TIME));
    }

    // 5E — Threat Report
    if (url.pathname === "/system/threat-report") {
      const report = await systemThreatReport(env);
      return json(report);
    }

    // 5F — Cloudflare Report (NEW)
    if (url.pathname === "/system/cloudflare-report") {
      const input = {
        trustZone: "system",
        workflow: "cloudflare-diagnostics"
      };

      const report = await runCloudflareDiagnostics(env, input);
      return json(report);
    }

    // ---------------------------------------------------------
    // 6. FINAL FALLBACK: Serve Public Assets
    // ---------------------------------------------------------
    if (env.ASSETS) {
      return await env.ASSETS.fetch(request);
    }

    return new Response("GIA Intelligence Engine Online. V12 Ready.", {
      headers: { "content-type": "text/plain" }
    });
  }
};
