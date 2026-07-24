/**
 * GIA DEEP Mind 2100
 * -------------------
 * Cloudflare-style handler that fronts your Deep Mind AI core.
 * JSON in, JSON out. Safe, audited, policy-enforced.
 */

import { AI } from "../sector/general/engine.js";
import manifest from "../ai/config/manifest.json";

let START_TIME = Date.now();
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // 1. SYSTEM STATUS ENDPOINT
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

        // 2. DEFAULT GET RESPONSE
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

        // 3. POST: AI CORE EXECUTION
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

