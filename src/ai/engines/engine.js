/**
 * engine.js - The GIA-2100 Resonance Core (Merged & Unified)
 */
/**
 * engine.js - GIA-2100 Integrated Resonance Core
 */
import { runAI } from "./index.js";
import { generateIdentityAnchor } from "../identity.js";
// NEW: Wiring in the utility suite
import { GIA_VERSION, SYSTEM_MODELS } from "../constants.js";
import { generateResonanceKey, formatLog } from "../helpers.js";
import { validateInput, checkAdminAccess } from "../validators.js";

export const AI = {
    async run(payload, env) {
        const { query, trustZone, identityHash } = payload;

        try {
            // 1. First Guardrail (Validator)
            const inputCheck = validateInput(payload);
            if (!inputCheck.valid) return { error: inputCheck.error };

            // 2. Identity Verification (Lasso of Truth)
            if (trustZone === "admin") {
                const masterAnchor = await generateIdentityAnchor(env.ADMIN_EIN, env.SECRET_SALT);
                if (identityHash !== masterAnchor) {
                    return { error: "Seven of Nine Protocol: Identity Match Failure" };
                }
            }

            // 3. Tesla-Style Resonance (Using Helper for clean keys)
            const cacheKey = generateResonanceKey(query);
            const cachedInsight = await env.GLOBAL_CACHE.get(cacheKey);
            if (cachedInsight) return { source: "cache", data: JSON.parse(cachedInsight) };

            // 4. Run Orchestrator (Passing Constants)
            const orchestratorResult = await runAI({ 
                ...payload, 
                env, 
                version: GIA_VERSION,
                model: SYSTEM_MODELS.PRIMARY 
            });
            
            // 5. Log to Herstory (D1)
            await env.GLOBAL_DB.prepare(
                "INSERT INTO logs (query, trust_zone, insight, status) VALUES (?, ?, ?, ?)"
            ).bind(query, trustZone, formatLog(orchestratorResult), "Success").run();

            return {
                status: "Success",
                version: GIA_VERSION,
                output: orchestratorResult
            };

        } catch (err) {
            return { error: "AI engine failure", details: err.message };
        }
    }
};

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
