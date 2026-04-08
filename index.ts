export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // AI Intelligence Route
    if (url.pathname === "/api/ai-chat") {
      const { prompt } = await request.json();
      const answer = await env.intelligence.run("@cf/meta/llama-3-8b-instruct", {
        prompt: `GIA System Assistant: ${prompt}`
      });
      return new Response(JSON.stringify(answer));
    }

    // TOP SECURITY: Forced Routing
    // This tells the worker: "If they ask for the home page, ONLY give them the clean index.html"
    if (url.pathname === "/" || url.pathname === "/index") {
       return await env.ASSETS.fetch(new Request(new URL("/index.html", url.origin)));
    }

    // Standard Asset Fetching
    return await env.ASSETS.fetch(request);
  },

  async scheduled(event, env, ctx) {
    // Your 1-minute Heartbeat stays here
    console.log("GIA Heartbeat Pulse: Verified.");
  }
};
