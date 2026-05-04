import infra from "src/backend/infrastructure/index.js";

export async function onRequest(context) {
    const { cf } = context.env;

    const report = await infra.diagnostics(cf);

    return new Response(JSON.stringify({
        system: "infrastructure",
        status: "ok",
        report
    }, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
}
