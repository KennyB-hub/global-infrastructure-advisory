export default {
  async fetch(request, env) {
    const { staffId } = await request.json();

    // Placeholder: pull metrics from KV or DB
    const jobsCompleted = 10;
    const avgHandleTime = 18; // minutes
    const idleRatio = 0.12;

    // Simple scoring model
    const score =
      jobsCompleted * 5 -
      avgHandleTime * 0.5 -
      idleRatio * 20;

    return new Response(
      JSON.stringify({
        staffId,
        score,
        breakdown: {
          jobsCompleted,
          avgHandleTime,
          idleRatio
        }
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
};
