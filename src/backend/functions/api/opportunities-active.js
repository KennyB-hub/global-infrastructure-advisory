opportunities-active.js
export async function onRequestGet(context) {
  const env = context.env;

  try {
    // 1. Get the most recent unfilled opportunity
    const { results } = await env.DB
      .prepare(`
        SELECT * FROM opportunities
        WHERE filled = 0
        ORDER BY updated_at DESC
        LIMIT 1
      `)
      .all();

    let active = results[0];

    // 2. If none found, rotate to ANY opportunity
    if (!active) {
      const { results: fallback } = await env.DB
        .prepare(`
          SELECT * FROM opportunities
          ORDER BY updated_at DESC
          LIMIT 1
        `)
        .all();
      active = fallback[0];
    }

    return new Response(JSON.stringify(active), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch active opportunity", details: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
