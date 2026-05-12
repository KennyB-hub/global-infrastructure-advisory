export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname.endsWith("/jobs")) {
      const list = await env.JOBS.list({ prefix: "job:" });
      const jobs = [];
      for (const k of list.keys) {
        const v = await env.JOBS.get(k.name);
        if (v) jobs.push(JSON.parse(v));
      }
      return json({ jobs });
    }

    if (request.method === "POST" && url.pathname.endsWith("/jobs")) {
      const body = await request.json();
      const id = `job:${Date.now()}`;
      const job = {
        id,
        title: body.title,
        sector: body.sector,
        priority: body.priority || "Medium",
        status: "Open",
        createdAt: new Date().toISOString()
      };
      await env.JOBS.put(id, JSON.stringify(job));
      return json(job, 201);
    }

    return new Response("Not found", { status: 404 });
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
