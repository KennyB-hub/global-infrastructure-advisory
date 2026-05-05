export default {
  async fetch(request, env) {
    const { staffId, action } = await request.json(); // "start" | "end"
    const now = new Date().toISOString();

    if (action === "start") {
      await env.STAFF_SHIFTS.put(`shift:${staffId}:${now}`, JSON.stringify({
        staffId,
        start: now
      }));
      return new Response(JSON.stringify({ status: "shift_started", staffId, start: now }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (action === "end") {
      // In a real system, you'd look up the latest open shift and close it.
      return new Response(JSON.stringify({ status: "shift_ended", staffId, end: now }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "invalid_action" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
};
