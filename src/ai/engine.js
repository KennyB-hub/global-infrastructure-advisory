/**
 * engine.js
 * ----------
 * Final assembly layer for Deep Mind AI.
 * This file exposes a single function: AI.run(input)
 * Everything else (policies, workflows, tools, filters, hooks)
 * is wired through the orchestrator.
 */

import { runAI } from "./index.js";

export const AI = {
    /**
     * Main entrypoint for all AI operations.
     * @param {Object} input - The request payload.
     * @returns {Promise<Object>} - Safe, validated AI output.
     */
    async run(input = {}) {
        try {
            const result = await runAI(input);
            return result;
        } catch (err) {
            return {
                error: "AI engine failure",
                details: err.message,
                trustZone: input.trustZone || "public"
            };
        }
    }
};
