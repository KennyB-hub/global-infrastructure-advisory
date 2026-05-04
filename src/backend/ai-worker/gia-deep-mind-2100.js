export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // ✅ ADD THIS BLOCK HERE
        if (url.pathname === "/system/status" && request.method === "GET") {
            return new Response(JSON.stringify({
                name: "GIA DEEP Mind 2100",
                status: "online",
                engine: manifest.engine,
                version: manifest.version,
                environment: manifest.environment,
                features: manifest.features,
                timestamp: Date.now()
            }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }
        // ✅ END OF NEW BLOCK

        // Existing GET response
        if (request.method !== "POST") {
            return new Response(JSON.stringify({
                name: "GIA DEEP Mind 2100",
                status: "online",
                message: "Send a POST with JSON to interact with the AI core."
            }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Existing POST logic
        let payload;
        try {
            payload = await request.json();
        } catch {
            return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const result = await AI.run(payload);
        const status = result.error ? 400 : 200;

        return new Response(JSON.stringify({
            engine: "GIA DEEP Mind 2100",
            ...result
        }), {
            status,
            headers: { "Content-Type": "application/json" }
        });
    }
};

