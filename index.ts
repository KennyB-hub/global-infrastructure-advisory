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
