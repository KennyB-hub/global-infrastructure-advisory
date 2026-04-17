/**
 * engine.js - The GIA-2100 Resonance Core (Merged & Unified)
 */
import { runAI } from "./index.js";
// This imports your hashing logic for the Lasso of Truth
import { generateIdentityAnchor } from "../identity.js"; 

export const AI = {
    async run(payload, env) {
        const { query, trustZone, identityHash } = payload;

        try {
            // 1. Identity Verification (The Lasso of Truth)
            if (trustZone === "admin") {
                const masterAnchor = await generateIdentityAnchor(env.ADMIN_EIN, env.SECRET_SALT);
                if (identityHash !== masterAnchor) {
                    return { error: "Seven of Nine Protocol: Identity Match Failure" };
                }
            }

            // 2. Tesla-Style Resonance Check (Global Cache)
            const cachedInsight = await env.GLOBAL_CACHE.get(`resonance:${query}`);
            if (cachedInsight) return { source: "cache", data: JSON.parse(cachedInsight) };

            // 3. Orchestrator Logic (Orchestrator handles Guardrails/Hooks)
            const orchestratorResult = await runAI({ ...payload, env });
            
            // 4. Log to D1 Database (Herstory)
            await env.GLOBAL_DB.prepare(
                "INSERT INTO logs (query, trust_zone, insight, status) VALUES (?, ?, ?, ?)"
            ).bind(query || "GIA_SYSTEM_PING", trustZone, JSON.stringify(orchestratorResult), "Success").run();

            return {
                status: "Success",
                engine: "GIA-2100-Resonance",
                output: orchestratorResult
            };

        } catch (err) {
            return {
                error: "AI engine failure",
                details: err.message,
                trustZone: trustZone || "public"
            };
        }
    }
};
