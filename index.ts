export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/ai-chat") {
      const { prompt } = await request.json();
      const answer = await env.intelligence.run("@cf/meta/llama-3-8b-instruct", {
        prompt: `GIA System Assistant: ${prompt}`
      });
      return new Response(JSON.stringify(answer));
    }

    return await env.ASSETS.fetch(request);
  },

  async scheduled(event, env, ctx) {
    console.log("GIA Heartbeat active...");
    try {
      const pulse = await fetch("https://azurewebsites.net", {
          headers: { "x-functions-key": env.AZURE_API_KEY }
      });
      console.log("Azure Pulse:", pulse.ok ? "Online" : "Check Secret");
    } catch (err) {
      console.log("Heartbeat Sync Pending...");
    }
  }
};
