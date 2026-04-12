export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. ROUTING: Redirect to Hubs
    if (url.pathname.includes("/hubs/contractor")) {
      return Response.redirect("https://pages.dev", 301);
    }

    // 2. API: Fetch Contractors from D1
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
        return new Response(JSON.stringify({ error: "D1 Engine Stall" }), { status: 500 });
      }
    }

    // 3. AI: Deep Mind Gemma-4 Bridge
    if (request.method === "POST" && url.pathname === "/api/deep-mind") {
      try {
        const { query } = await request.json();
        const aiResponse = await env.AI.run("@cf/google/gemma-4-26b-it", {
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
        return new Response(JSON.stringify({ result: "Deep Mind offline. Verify AI binding." }), { status: 500 });
      }
    }

    // DEFAULT RESPONSE
    return new Response("GIA Intelligence Engine Online. V12 Ready.", {
      headers: { "content-type": "text/plain" }
    });
  }
}
