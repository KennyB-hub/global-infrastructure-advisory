/**
 * system-ai.js
 * --------------
 * AI Cortex introspection endpoint.
 * Describes available organs, tools, and safe surfaces for AI.
 */

export async function onRequest() {
    const report = {
        timestamp: new Date().toISOString(),
        cortex: {
            organs: [
                "infrastructure",
                "security",
                "services",
                "workers/system",
                "workers/admin",
                "workers/public"
            ],
            safeSurfaces: [
                "/system/status",
                "/system/infrastructure",
                "/system/storage",
                "/system/routing",
                "/system/full-report",
                "/system/security",
                "/system/map"
            ],
            adminEndpoints: [
                "/admin/login",
                "/admin/users",
                "/admin/metrics",
                "/admin-endpoints.js"
            ],
            notes: "AI Cortex must treat all write-capable endpoints as guarded surfaces requiring explicit policy."
        }
    };

    return new Response(JSON.stringify({
        system: "ai",
        status: "ok",
        report
    }, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
}
