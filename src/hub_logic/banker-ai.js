export default {
  async fetch(request, env) {
    const { accountId, action, amount, meta } = await request.json();

    if (action === "balance") {
      const bal = parseFloat((await env.LEDGER.get(`acct:${accountId}`)) || "0");
      return json({ accountId, balance: bal });
    }

    if (action === "credit") {
      const bal = parseFloat((await env.LEDGER.get(`acct:${accountId}`)) || "0");
      const next = bal + Number(amount || 0);
      await env.LEDGER.put(`acct:${accountId}`, next.toString());
      await log(env, accountId, "credit", amount, meta);
      return json({ accountId, balance: next });
    }

    if (action === "debit") {
      const bal = parseFloat((await env.LEDGER.get(`acct:${accountId}`)) || "0");
      const next = bal - Number(amount || 0);
      await env.LEDGER.put(`acct:${accountId}`, next.toString());
      await log(env, accountId, "debit", amount, meta);
      return json({ accountId, balance: next });
    }

    return json({ error: "invalid_action" }, 400);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

async function log(env, accountId, type, amount, meta) {
  const key = `txn:${accountId}:${Date.now()}`;
  await env.LEDGER_LOG.put(
    key,
    JSON.stringify({ accountId, type, amount, meta, ts: new Date().toISOString() })
  );
}
