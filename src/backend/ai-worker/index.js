// src/backend/workers/index.js
import { getTrustZone, checkTrust } from "../system/trust-middleware.js";
import * as publicWorker from "./public/index.js";
import * as contractorWorker from "./contractor/index.js";
import * as farmerWorker from "./farmer/index.js";
import * as govWorker from "./gov/index.js";
import * as deepgovWorker from "./deepgov/index.js";
import * as adminWorker from "./admin/index.js";
import * as systemWorker from "./system/index.js";

export async function onRequest(context) {
    const url = new URL(context.request.url);
    const path = url.pathname;
    const zone = getTrustZone(path);

    if (!checkTrust(zone, context.request)) {
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

    return new Response(JSON.stringify({
        status: "not-found",
        path
    }, null, 2), {
        status: 404,
        headers: { "Content-Type": "application/json" }
    });
}
