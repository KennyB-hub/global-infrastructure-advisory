// src/hubs-logic/payroll-run.js

export default {
  async fetch(request, env) {
    const now = Date.now();
    const timestamp = new Date(now).toISOString();

    // 1. Load all staff records
    const staffList = await env.HR.list({ prefix: "person:" });
    const results = [];

    for (const entry of staffList.keys) {
      const personRaw = await env.HR.get(entry.name);
      if (!personRaw) continue;

      const person = JSON.parse(personRaw);

      // 2. Extract payroll fields
      const gross = Number(person.payRate || 0);
      const taxRate = Number(person.taxRate || 0.18);
      const benefits = Number(person.benefits || 0);
      const currency = person.currency || "USD";

      // 3. Multi‑currency conversion
      let fxRate = 1;
      if (currency !== "USD") {
        const fx = await env.FX.get(currency);
        fxRate = fx ? parseFloat(fx) : 1;
      }

      // 4. Deductions
      const tax = gross * taxRate;
      const net = (gross - tax - benefits) * fxRate;

      // 5. Payout via BankerAI
      const payout = await fetch(env.BANKER_AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: person.accountId,
          action: "credit",
          amount: net,
          meta: {
            type: "payroll",
            personId: person.id,
            gross,
            tax,
            benefits,
            net,
            currency,
            fxRate,
            timestamp
          }
        })
      }).then((r) => r.json());

      // 6. Log to AccountantAI ledger
      await env.LEDGER_LOG.put(
        `txn:payroll:${person.id}:${now}`,
        JSON.stringify({
          accountId: person.accountId,
          type: "credit",
          amount: net,
          meta: {
            payroll: true,
            gross,
            tax,
            benefits,
            net,
            currency,
            fxRate,
            personId: person.id
          },
          ts: timestamp
        })
      );

      // 7. Add to results
      results.push({
        personId: person.id,
        name: person.name,
        gross,
        tax,
        benefits,
        net,
        currency,
        fxRate,
        payout
      });
    }

    // 8. Save payroll run summary
    const runId = `payroll:${now}`;
    await env.PAYROLL.put(
      runId,
      JSON.stringify({
        id: runId,
        timestamp,
        total: results.reduce((sum, r) => sum + r.net, 0),
        employees: results.length,
        results
      })
    );

    return new Response(
      JSON.stringify({
        status: "ok",
        runId,
        timestamp,
        employees: results.length,
        results
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
};
