import { getTrustZones } from "src/backend/system/trust.js";

export async function onRequest() {
    const report = getTrustZones();

    return new Response(JSON.stringify({
        system: "trust",
        status: "ok",
        report
    }, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
}
