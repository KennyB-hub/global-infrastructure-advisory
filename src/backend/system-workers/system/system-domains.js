import { getDomainStatus } from "src/backend/system/domains.js";

export async function onRequest() {
    const report = getDomainStatus();

    return new Response(JSON.stringify({
        system: "domains",
        status: "ok",
        report
    }, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
}
