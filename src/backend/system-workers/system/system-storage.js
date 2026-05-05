import { storageInspector } from "src/backend/infrastructure/tools/storage-inspector.js";

export async function onRequest(context) {
    const { cf } = context.env;

    const report = await storageInspector(cf);

    return new Response(JSON.stringify({
        system: "storage",
        status: "ok",
        report
    }, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
}
