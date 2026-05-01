let START_TIME = Date.now();

import { systemStatus } from "../../backend/system/system-endpoints.js";
import { diagnostics } from "../../backend/system/diagnostics.js";
import { uptime } from "../../backend/system/uptime.js";
import { fullReport } from "../../backend/system/full-report.js";
import { systemThreatReport } from "../../backend/system/threat-report.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ---------------------------------------------------------
    // 1. ROUTING: Redirect to Hubs
    // ---------------------------------------------------------
    if (url.pathname.includes("/hubs/contractor")) {
      return Response.redirect("https://pages.dev", 301);
    }

    // ---------------------------------------------------------
    // 2. API: Fetch Contractors from D1
    // ---------------------------------------------------------
    if (url.pathname === "/api/contractors") {
      try {
        const { results } = await env.DB.prepare("SELECT * FROM contractors").all();
        return new Response(JSON.stringify({ results }), {
          headers: { 
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*" 
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "D1 Engine Stall" }), { 
          status: 500,
          headers: { "Access-Control-Allow-Origin": "*" }
        });
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

        return new Response(JSON.stringify({ result: aiResponse.response }), {
          headers: { 
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*" 
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ result: "Satellite sweep failed: Deep Mind offline." }), { 
          status: 500,
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      }
    }

    // ---------------------------------------------------------
    // 4. SYSTEM ENDPOINTS
    // ---------------------------------------------------------
    if (url.pathname === "/system/status") {
      const manifest = { engine: "GIA Deep Mind 2100", version: "1.0" };
      return new Response(JSON.stringify(systemStatus(manifest), null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (url.pathname === "/system/diagnostics") {
      return new Response(JSON.stringify(diagnostics(env.AI), null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (url.pathname === "/system/uptime") {
      return new Response(JSON.stringify(uptime(START_TIME), null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (url.pathname === "/system/full-report") {
      const manifest = { engine: "GIA Deep Mind 2100", version: "1.0" };
      return new Response(JSON.stringify(fullReport(manifest, env.AI, START_TIME), null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (url.pathname === "/system/threat-report") {
      const report = await systemThreatReport(env);
      return new Response(JSON.stringify(report, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // ---------------------------------------------------------
    // 5. FINAL FALLBACK: Serve Public Assets
    // ---------------------------------------------------------
    if (env.ASSETS) {
      return await env.ASSETS.fetch(request);
    }

    return new Response("GIA Intelligence Engine Online. V12 Ready.", {
      headers: { "content-type": "text/plain" }
    });
  }
};
