export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/ai-chat" && request.method === "POST") {
      const { prompt, lat, lon, contractorId } = await request.json();

      // 1. SAVE TO DATABASE (D1)
      await env.DB.prepare(
        "INSERT INTO job_sites (contractor_id, latitude, longitude) VALUES (?, ?, ?)"
      ).bind(contractorId, lat, lon).run();

      // 2. ASK THE AI
      const aiResponse = await env.intelligence.run("@cf/meta/llama-3-8b-instruct", {
        prompt: `System: Contractor at GPS ${lat}, ${lon}. Query: ${prompt}`
      });

      return new Response(JSON.stringify({ response: aiResponse.response }));
    }

    return await env.ASSETS.fetch(request);
  },

  async scheduled(event, env, ctx) {
    console.log("GIA System Pulse: All Sectors Synchronized.");
  }
};

  async scheduled(event, env, ctx) {
    // Your 1-minute Heartbeat stays here
    console.log("GIA Heartbeat Pulse: Verified.");
  }
};
