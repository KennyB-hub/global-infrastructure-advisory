debug-worker.js
import { AI } from "../trust/engine.js";

export default {
    async fetch(request) {
        const url = new URL(request.url);

        const debug = {
            worker: "debug-worker",
            method: request.method,
            path: url.pathname,
            timestamp: Date.now()
        };

        if (request.method !== "POST") {
            return new Response(JSON.stringify({
                message: "Debug Worker online",
                instructions: "Send POST with JSON to test AI engine.",
                debug
            }, null, 2), { status: 200 });
        }

        let payload;
        try {
            payload = await request.json();
        } catch (err) {
            return new Response(JSON.stringify({
                error: "Invalid JSON",
                details: err.message,
                debug
            }, null, 2), { status: 400 });
        }

        try {
            const result = await AI.run(payload);
            return new Response(JSON.stringify({ debug, payload, result }, null, 2), { status: 200 });
        } catch (err) {
            return new Response(JSON.stringify({
                error: "AI engine error",
                details: err.message,
                stack: err.stack,
                payload,
                debug
            }, null, 2), { status: 500 });
        }
    }
};
