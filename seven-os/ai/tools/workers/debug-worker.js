/**
 * debug-worker.js
 * ----------------
 * Transparent debugging Worker for GIA Deep Mind 2100.
 * No trust-zones, no governor, no policy filters.
 * Logs everything and returns raw AI engine output.
 */

import { AI } from "../../../backend/trust/engine.js";

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Debug header
        const debugInfo = {
            worker: "debug-worker",
            method: request.method,
            path: url.pathname,
            timestamp: Date.now(),
            cf: request.cf || null
        };

        // Only POST is meaningful, but GET returns debug info
        if (request.method !== "POST") {
            return new Response(JSON.stringify({
                message: "Debug Worker online",
                instructions: "Send POST with JSON to test AI engine.",
                debug: debugInfo
            }, null, 2), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Parse JSON
        let payload;
        try {
            payload = await request.json();
        } catch (err) {
            return new Response(JSON.stringify({
                error: "Invalid JSON body",
                details: err.message,
                debug: debugInfo
            }, null, 2), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Run AI engine *raw* (no trust zones, no filters)
        let result;
        try {
            result = await AI.run(payload, env);
        } catch (err) {
            return new Response(JSON.stringify({
                error: "AI engine threw an exception",
                details: err.message,
                stack: err.stack,
                payload,
                debug: debugInfo
            }, null, 2), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Return raw engine output + debug metadata
        return new Response(JSON.stringify({
            debug: debugInfo,
            payload,
            result
        }, null, 2), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    }
};

