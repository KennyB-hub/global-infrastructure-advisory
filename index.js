export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // If someone asks for the contractor hub
    if (url.pathname.includes("/hubs/contractor")) {
      // You can redirect them to the Pages site where the file lives
      return Response.redirect("https://pages.dev", 301);
    }

    // Otherwise, run your Deep Mind AI logic here...
    return new Response("GIA Intelligence Engine Online.");
  }
}

if (url.pathname === "/api/contractors") {
    const { results } = await env.DB.prepare("SELECT * FROM contractors").all();
    return new Response(JSON.stringify({ results }), {
        headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
}
