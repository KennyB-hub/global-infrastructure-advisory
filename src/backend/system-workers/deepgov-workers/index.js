// src/backend/workers/deepgov/index.js

function requireDeepGov(request) {
    const role = request.headers.get("X-Role");
    return role === "deepgov";
}

export async function onRequest(context) {
    const { request } = context;

    if (!requireDeepGov(request)) {
        return new Response(JSON.stringify({
            zone: "deepgov",
            status: "forbidden"
        }, null, 2), {
            status: 403,
            headers: { "Content-Type": "application/json" }
        });
    }

    const url = new URL(request.url);

    return new Response(JSON.stringify({
        zone: "deepgov",
        path: url.pathname,
        access: "sovereign-only",
        status: "ok",
        timestamp: new Date().toISOString()
    }, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
}
