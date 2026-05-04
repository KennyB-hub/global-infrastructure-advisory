import * as status from "./system-status.js";
import * as full from "./system-full-report.js";
import * as domains from "./system-domains.js";
import * as trust from "./system-trust.js";
import * as uptime from "./system-uptime.js";
import * as infra from "./system-infrastructure.js";
import * as storage from "./system-storage.js";
import * as routing from "./system-routing.js";
import * as health from "./system-health.js";
import * as security from "./system-security.js";
import * as ai from "./system-ai.js";
import * as map from "./system-map.js";

export async function onRequest(context) {
    const url = new URL(context.request.url);
    const path = url.pathname;

    if (path.endsWith("/status")) return status.onRequest(context);
    if (path.endsWith("/full-report")) return full.onRequest(context);
    if (path.endsWith("/domains")) return domains.onRequest(context);
    if (path.endsWith("/trust")) return trust.onRequest(context);
    if (path.endsWith("/uptime")) return uptime.onRequest(context);
    if (path.endsWith("/infrastructure")) return infra.onRequest(context);
    if (path.endsWith("/storage")) return storage.onRequest(context);
    if (path.endsWith("/routing")) return routing.onRequest(context);
    if (path.endsWith("/health")) return health.onRequest(context);
    if (path.endsWith("/security")) return security.onRequest(context);
    if (path.endsWith("/ai")) return ai.onRequest(context);
    if (path.endsWith("/map")) return map.onRequest(context);

    return new Response(JSON.stringify({
        system: "router",
        status: "not-found",
        path
    }, null, 2), {
        status: 404,
        headers: { "Content-Type": "application/json" }
    });
}

// src/backend/workers/system/index.js

export async function onRequest() {
    return new Response(JSON.stringify({
        zone: "system",
        access: "system-only",
        endpoints: [
            "/system/status",
            "/system/full-report",
            "/system/domains",
            "/system/trust",
            "/system/uptime",
            "/system/infrastructure",
            "/system/storage",
            "/system/routing",
            "/system/health",
            "/system/security",
            "/system/ai",
            "/system/map"
        ],
        timestamp: new Date().toISOString()
    }, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
}
