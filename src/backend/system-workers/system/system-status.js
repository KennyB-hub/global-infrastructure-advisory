export async function onRequest(context) {
    const now = Date.now();

    const report = {
        timestamp: new Date(now).toISOString(),
        uptime: context.env?.UPTIME || "unknown",
        environment: context.env?.ENVIRONMENT || "production",
        healthy: true,
        status: "ok"
    };

    return new Response(JSON.stringify({
        system: "status",
        status: "ok",
        report
    }, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
}
