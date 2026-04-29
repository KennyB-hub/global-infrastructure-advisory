/**
 * GIA DEEP Mind 2100
 * -------------------
 * Cloudflare-style handler that fronts your Deep Mind AI core.
 * JSON in, JSON out. Safe, audited, policy-enforced.
 */

import { AI } from "../ai/engine.js";

export default {
    /**
     * Cloudflare Worker-style fetch handler
     */
    async fetch(request, env, ctx) {
        if (request.method !== "POST") {
            return new Response(
                JSON.stringify({
                    name: "GIA DEEP Mind 2100",
                    status: "online",
                    message: "Send a POST with JSON to interact with the AI core."
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        let payload;
        try {
            payload = await request.json();
        } catch {
            return new Response(
                JSON.stringify({ error: "Invalid JSON body." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
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
