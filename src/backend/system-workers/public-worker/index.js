// src/backend/workers/public/index.js

export async function onRequest(context) {
    const url = new URL(context.request.url);

    return new Response(JSON.stringify({
        zone: "public",
        path: url.pathname,
        access: "open",
        status: "ok",
        timestamp: new Date().toISOString()
    }, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
}
