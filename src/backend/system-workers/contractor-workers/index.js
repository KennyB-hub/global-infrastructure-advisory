function requireAuth(request) {
    const auth = request.headers.get("Authorization");
    return !!auth;
}

export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);

    if (!requireAuth(request)) {
        return new Response(JSON.stringify({
            zone: "contractor",
            status: "unauthorized"
        }, null, 2), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    if (url.pathname.endsWith("/contractor/status")) {
        return new Response(JSON.stringify({
            zone: "contractor",
            endpoint: "status",
            status: "ok",
            timestamp: new Date().toISOString()
        }, null, 2), {
            headers: { "Content-Type": "application/json" }
        });
    }

    return new Response(JSON.stringify({
        zone: "contractor",
        status: "not-found",
        path: url.pathname
    }, null, 2), {
        status: 404,
        headers: { "Content-Type": "application/json" }
    });
}
