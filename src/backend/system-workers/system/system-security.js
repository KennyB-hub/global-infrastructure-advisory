import { inspectRouting } from "../../security/tools/inspect-routing.js";
import { threatScan } from "../../security/tools/threat-scan.js";

export async function onRequest(context) {
    const { cf, ai } = context.env;

    const [threats, routing] = await Promise.all([
        threatScan(cf, ai),
        inspectRouting(context.request.url, cf, ai)
    ]);

    const report = {
        timestamp: new Date().toISOString(),
        threats,
        routing
    };

    return new Response(JSON.stringify({
        system: "security",
        status: "ok",
        report
    }, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
}

