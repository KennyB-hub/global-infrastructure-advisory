import { systemFullReport } from "scr/backend/system/system-full-report.js";
import infra from "../../infrastructure/index.js";
import { storageInspector } from "src/backend/infrastructure/tools/storage-inspector.js";
import { inspectRouting } from "src/backend/security/tools/inspect-routing.js";

export async function onRequest(context) {
    const { cf, ai } = context.env;
    const manifest = context.env?.MANIFEST || {};

    //
    // 1. BACKEND SYSTEM REPORT (Deep Mind 2100)
    //
    const backendReport = systemFullReport(manifest, ai);

    //
    // 2. INFRASTRUCTURE + SECURITY REPORTS
    //
    const [infraReport, storage, routing] = await Promise.all([
        infra.diagnostics(cf),
        storageInspector(cf),
        inspectRouting(context.request.url, cf, ai)
    ]);

    //
    // 3. FINAL UNIFIED REPORT
    //
    const report = {
        timestamp: new Date().toISOString(),
        backend: backendReport,
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
