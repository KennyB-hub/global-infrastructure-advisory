export default {
  async fetch(request, env) {
    const { staffId, sectorId } = await request.json();
    const timestamp = new Date().toISOString();

    await env.STAFF_ASSIGN.put(
      `assign:${staffId}`,
      JSON.stringify({ staffId, sectorId, timestamp })
    );

    return new Response(
      JSON.stringify({ status: "assigned", staffId, sectorId }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
};
