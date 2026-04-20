export interface Env {
  A_TEAM_STORAGE: KVNamespace;
  DB: D1Database;
  intelligence: any; // AI Binding
  ASSETS: Fetcher;   // Pages Binding
  AZURE_SERVICE_TOKEN: string; // Secret
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const userAgent = request.headers.get("User-Agent") || "";

    // 1. SECURITY SHIELD: Block Bots
    if (userAgent.match(/Bot|Crawler|Scraper/i)) {
      return new Response("GIA Security: Access Denied.", { status: 403 });
    }

    // 2. STATUS & DOCS
    if (url.pathname === "/status") {
      return new Response("GIA DEEP MIND INTERFACE: SECURE & ACTIVE");
    }
    if (url.pathname === "/dsn-docs") {
      const docs = await env.A_TEAM_STORAGE.get("dsn_documentation");
      return new Response(docs || "System Ready. Awaiting Data.");
    }

    // 3. AI & GPS LOGIC (POST /api/ai-chat)
    if (url.pathname === "/api/ai-chat" && request.method === "POST") {
      const { prompt, lat, lon, contractorId } = await request.json() as any;
      await env.DB.prepare("INSERT INTO job_sites (contractor_id, latitude, longitude) VALUES (?, ?, ?)")
               .bind(contractorId, lat, lon).run();
      const aiResponse = await env.intelligence.run("@cf/meta/llama-3-8b-instruct", { 
        prompt: `Contractor at GPS ${lat}, ${lon}. Query: ${prompt}` 
      });
      return new Response(JSON.stringify({ response: aiResponse.response }));
    }

    // 4. THE BRIDGE: Azure Tunnel
    if (url.pathname.startsWith("/api/v1/heavy-data")) {
      return await fetch(`https://globalnfrastructreavisory.com${url.pathname}`, {
        method: request.method,
        headers: { "X-GIA-Secret": env.AZURE_SERVICE_TOKEN },
        body: request.body
      });
    }

    // 5. ASSETS/UI: Default Fallback
    return await env.ASSETS.fetch(request);
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log("GIA Security Pulse: Active & Guarded.");
  }
};
