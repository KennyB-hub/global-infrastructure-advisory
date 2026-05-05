import { systemStatusReport } from "src/backend/system/system-status.js";

export async function onRequest(context) {
    const manifest = context.env?.MANIFEST || {};

    const report = systemStatusReport(manifest);

    return new Response(JSON.stringify({
        system: "status",
        status: "ok",
        report
    }, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
}
