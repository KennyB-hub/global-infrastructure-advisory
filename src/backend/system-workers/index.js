// GIA Unified Worker Entry
// Handles both Trust‑Zone Routing and API Routing

import { handleApiRequest } from "../functions/api/index.js";
import { getTrustZone, checkTrust } from "../system/trust-middleware.js";

import * as publicWorker from "./public/index.js";
import * as contractorWorker from "./contractor/index.js";
import * as farmerWorker from "./farmer/index.js";
import * as govWorker from "./gov/index.js";
import * as deepgovWorker from "./deepgov/index.js";
import * as adminWorker from "./admin/index.js";
import * as systemWorker from "./system/index.js";

export async function onRequest(context) {
    const request = context.request;
    const url = new URL(request.url);
    const path = url.pathname;

    // -----------------------------------------
    // 1. API ROUTING (NEW)
    // -----------------------------------------
    if (path.startsWith("/api/")) {
        try {
            return await handleApiRequest(request, context.env, context);
        } catch (err) {
            return new Response(JSON.stringify({
                error: "API Internal Error",
                message: err.message
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
    }

    // -----------------------------------------
    // 2. TRUST‑ZONE ROUTING (EXISTING)
    // -----------------------------------------
    const zone = getTrustZone(path);

    if (!checkTrust(zone, request)) {
        return new Response(JSON.stringify({
            status: "forbidden",
            zone,
            path
        }, null, 2), {
            status: 403,
            headers: { "Content-Type": "application/json" }
        });
    }

    if (zone === "public") return publicWorker.onRequest(context);
    if (zone === "contractor") return contractorWorker.onRequest(context);
    if (zone === "farmer") return farmerWorker.onRequest(context);
    if (zone === "gov") return govWorker.onRequest(context);
    if (zone === "deepgov") return deepgovWorker.onRequest(context);
    if (zone === "admin") return adminWorker.onRequest(context);
    if (zone === "system") return systemWorker.onRequest(context);

    // -----------------------------------------
    // 3. FALLBACK
    // -----------------------------------------
    return new Response(JSON.stringify({
        status: "not-found",
        path
    }, null, 2), {
        status: 404,
        headers: { "Content-Type": "application/json" }
    });
}
