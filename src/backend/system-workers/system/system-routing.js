import { inspectRouting } from "../../security/tools/inspect-routing.js";

export async function onRequest(context) {
    const { cf, ai } = context.env;

    const report = await inspectRouting(context.request.url, cf, ai);

    return new Response(JSON.stringify({
        system: "routing",
        status: "ok",
        report
    }, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
}
