export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. ROUTE: AI Blueprint Assistant
    if (url.pathname === "/api/ai-chat") {
      const { prompt } = await request.json();
      const answer = await env.intelligence.run("@cf/meta/llama-3-8b-instruct", {
        prompt: `You are the GIA Intelligence System. Help this contractor: ${prompt}`
      });
      return new Response(JSON.stringify(answer), { headers: { "Content-Type": "application/json" } });
    }

    // 2. ROUTE: GPS Heartbeat (Staff/Contractor Tracking)
    if (url.pathname === "/api/heartbeat") {
      // Here is where we will log the GPS to your Azure vault later
      return new Response(JSON.stringify({ status: "Pulse Verified", timestamp: new Date() }));
    }

    // 3. DEFAULT: Serve your Clean HTML Hubs
    return await env.ASSETS.fetch(request);
  }
};
