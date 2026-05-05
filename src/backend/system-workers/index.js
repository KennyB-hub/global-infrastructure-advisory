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

    if (path.startsWith("/public/")) return publicWorker.onRequest(context);
    if (path.startsWith("/contractor/")) return contractorWorker.onRequest(context);
    if (path.startsWith("/farmer/")) return farmerWorker.onRequest(context);
    if (path.startsWith("/gov/")) return govWorker.onRequest(context);
    if (path.startsWith("/deepgov/")) return deepgovWorker.onRequest(context);
    if (path.startsWith("/admin/")) return adminWorker.onRequest(context);
    if (path.startsWith("/system/")) return systemWorker.onRequest(context);

    return new Response(JSON.stringify({
        status: "not-found",
        message: "No matching worker route",
        path
    }, null, 2), {
        status: 404,
        headers: { "Content-Type": "application/json" }
    });
}
