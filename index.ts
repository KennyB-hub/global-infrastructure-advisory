export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. SECURITY SHIELD: Block Bad Bots & Crawlers
    const userAgent = request.headers.get("User-Agent") || "";
    if (userAgent.includes("Bot") || userAgent.includes("Crawler") || userAgent.includes("Scraper")) {
      return new Response("GIA Security: Access Denied.", { status: 403 });
    }

    // 2. AI & GPS LOGIC (The Hubs)
    if (url.pathname === "/api/ai-chat" && request.method === "POST") {
      const { prompt, lat, lon, contractorId } = await request.json();
      
      // Save GPS to D1
      await env.DB.prepare(
        "INSERT INTO job_sites (contractor_id, latitude, longitude) VALUES (?, ?, ?)"
      ).bind(contractorId, lat, lon).run();

      // Run AI Inference
      const aiResponse = await env.intelligence.run("@cf/meta/llama-3-8b-instruct", {
        prompt: `Contractor at GPS ${lat}, ${lon}. Query: ${prompt}`
      });

      return new Response(JSON.stringify({ response: aiResponse.response }));
    }

    // 3. ASSETS: Serve the Clean HTML
    return await env.ASSETS.fetch(request);
  },

  async scheduled(event, env, ctx) {
    // 4. HEARTBEAT: Automated Pulse every minute
    console.log("GIA Security Pulse: Active & Guarded.");
  }
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. SECURITY SHIELD (Bots)
    // ... your bot blocking code ...

    // 2. THE BRIDGE: Route specific requests to Azure
    if (url.pathname.startsWith("/api/v1/heavy-data")) {
      // Your private tunnel endpoint (only accessible via Worker)
      const azureBackend = "https://globalnfrastructreavisory.com"; 

      const response = await fetch(`${azureBackend}${url.pathname}`, {
        method: request.method,
        headers: {
          "X-GIA-Secret": env.AZURE_SERVICE_TOKEN, // Verify Worker to Azure
          "Authorization": request.headers.get("Authorization") // Pass identity
        },
        body: request.body // Pass along the data
      });
      return response;
    }

    // 3. ASSETS: If it's not an API call, serve the UI
    return await env.ASSETS.fetch(request);
  },

  async scheduled(event, env, ctx) {
    // ... your 15-minute sync pulse ...
  }
};

export interface Env {
  A_TEAM_STORAGE: KVNamespace;
  DB: D1Database;
}

export interface Env {
  A_TEAM_STORAGE: KVNamespace;
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Lock down to your specific pages.dev domain
    if (url.hostname !== "4882dee7.global-infrastructure-advisory.pages.dev") {
      return new Response("Unauthorized Host", { status: 403 });
    }

    try {
      // Basic check to see if we're connected to KV
      if (url.pathname === "/test-kv") {
        const value = await env.A_TEAM_STORAGE.get("test_key");
        return new Response(`KV Connection: ${value || "No data yet"}`);
      }

      return new Response("GIA Intelligence Service: Online and Connected");
    } catch (err: any) {
      return new Response(`Connection Error: ${err.message}`, { status: 500 });
    }
  },
};
