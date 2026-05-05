export async function onRequest(context) {
    const start = Date.now();

    // Simulated latency check
    const latency = Date.now() - start;

    const report = {
        timestamp: new Date().toISOString(),
        environment: context.env?.ENVIRONMENT || "production",
        latency,
        healthy: latency < 500,
        uptime: context.env?.UPTIME || "unknown",
        retriesAllowed: 3,
        status: "ok"
    };

    return new Response(JSON.stringify({
        system: "health",
        status: "ok",
        report
    }, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
}
