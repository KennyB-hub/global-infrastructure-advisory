import infra from "src/backend/infrastructure/index.js";
import { storageInspector } from "src/backend/infrastructure/tools/storage-inspector.js";
import { inspectRouting } from "src/backend/security/tools/inspect-routing.js";

export async function onRequest(context) {
    const { cf, ai } = context.env;

    const [infraReport, storage, routing] = await Promise.all([
        infra.diagnostics(cf),
        storageInspector(cf),
        inspectRouting(context.request.url, cf, ai)
    ]);

    const report = {
        timestamp: new Date().toISOString(),
        infrastructure: infraReport,
        storage,
        routing
    };

    return new Response(JSON.stringify({
        system: "full-report",
        status: "ok",
        report
    }, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
}
