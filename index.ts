export default {
  // PART 1: Handles the Website & AI Chat
  async fetch(request, env) {
    const url = new URL(request.url);

    // AI Intelligence Route
    if (url.pathname === "/api/ai-chat" && request.method === "POST") {
      const { prompt, lat, lon, contractorId } = await request.json();
      
      // Save GPS to D1 Database
      await env.DB.prepare(
        "INSERT INTO job_sites (contractor_id, latitude, longitude) VALUES (?, ?, ?)"
      ).bind(contractorId, lat, lon).run();

      // Ask the AI
      const aiResponse = await env.intelligence.run("@cf/meta/llama-3-8b-instruct", {
        prompt: `System: Contractor at GPS ${lat}, ${lon}. Query: ${prompt}`
      });

      return new Response(JSON.stringify({ response: aiResponse.response }));
    }

    // Default: Serve the Clean HTML Hubs
    return await env.ASSETS.fetch(request);
  },

  // PART 2: Handles the 1-Minute Heartbeat
  async scheduled(event, env, ctx) {
    console.log("GIA Heartbeat Pulse: Verified.");
  }
};
