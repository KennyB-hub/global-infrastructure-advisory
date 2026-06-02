export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname.endsWith("/ledger")) {
      const list = await env.LEDGER_LOG.list({ prefix: "txn:" });
      const txns = [];
      for (const k of list.keys) {
        const v = await env.LEDGER_LOG.get(k.name);
        if (v) txns.push(JSON.parse(v));
      }
      return json({ txns });
    }

    if (request.method === "GET" && url.pathname.endsWith("/summary")) {
      // Placeholder: simple aggregation
      const list = await env.LEDGER_LOG.list({ prefix: "txn:" });
      let credits = 0;
      let debits = 0;

      for (const k of list.keys) {
        const v = await env.LEDGER_LOG.get(k.name);
        if (!v) continue;
        const t = JSON.parse(v);
        if (t.type === "credit") credits += Number(t.amount || 0);
        if (t.type === "debit") debits += Number(t.amount || 0);
      }

      return json({ credits, debits, net: credits - debits });
    }

    return json({ error: "not_found" }, 404);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
