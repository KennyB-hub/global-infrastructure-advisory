function requireGovAccess(request) {
    const role = request.headers.get("X-Role");
    return role === "gov" || role === "deepgov";
}

export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);

    if (!requireGovAccess(request)) {
        return new Response(JSON.stringify({
            zone: "gov",
            status: "forbidden"
        }, null, 2), {
            status: 403,
            headers: { "Content-Type": "application/json" }
        });
    }

    if (url.pathname.endsWith("/gov/status")) {
        return new Response(JSON.stringify({
            zone: "gov",
            endpoint: "status",
            status: "ok",
            timestamp: new Date().toISOString()
        }, null, 2), {
            headers: { "Content-Type": "application/json" }
        });
    }

    return new Response(JSON.stringify({
        zone: "gov",
        status: "not-found",
        path: url.pathname
    }, null, 2), {
        status: 404,
        headers: { "Content-Type": "application/json" }
    });
}
