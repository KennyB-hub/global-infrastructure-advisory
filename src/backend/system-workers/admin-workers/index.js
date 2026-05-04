export async function onRequest(context) {
    const role = context.request.headers.get("X-Role");

    if (role !== "admin") {
        return new Response(JSON.stringify({
            zone: "admin",
            status: "forbidden"
        }, null, 2), {
            status: 403,
            headers: { "Content-Type": "application/json" }
        });
    }

    return new Response(JSON.stringify({
        zone: "admin",
        access: "admin-only",
        status: "ok",
        timestamp: new Date().toISOString()
    }, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
}
