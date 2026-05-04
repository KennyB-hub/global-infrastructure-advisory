import { getUptime } from "src/backend/system/uptime.js";

export async function onRequest() {
    const report = getUptime();

    return new Response(JSON.stringify({
        system: "uptime",
        status: "ok",
        report
    }, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
}
