import { getAiRoutingMap } from "../../system/ai-routing.js";

export async function onRequest() {
    const routing = getAiRoutingMap();

    const cortex = {
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
    };

    const report = {
        timestamp: new Date().toISOString(),
        routing,
        cortex
    };

    return new Response(JSON.stringify({
        system: "ai-routing",
        status: "ok",
        report
    }, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
}
