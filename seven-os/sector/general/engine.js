// seven-os/ai/engine.js

// ---------------------------------------------------------
// IMPORTS MUST BE AT THE TOP (JS requirement)
// ---------------------------------------------------------
import { analyzeThreat } from "../../system/security/threat-engine.js";
import { recordThreatEvent } from "../../backend/threat/threat-telemetry.js";

// ---------------------------------------------------------
// MAIN AI ENGINE
// ---------------------------------------------------------
export const AI = {
    async run(payload, env) {
        const { query, trustZone, identityHash } = payload;

        // -----------------------------------------------------
        // 1. THREAT ANALYSIS (before anything else)
        // -----------------------------------------------------
        const threat = analyzeThreat(query, { sector: trustZone || "public" });

        // Store threat event in KV
        try {
            await recordThreatEvent(env, threat);
        } catch (err) {
            // Fail-safe: never break the engine if KV fails
            console.error("Threat telemetry failure:", err.message);
        }

        // -----------------------------------------------------
        // 2. TRUST ZONE ENFORCEMENT
        // -----------------------------------------------------
        if (trustZone === "admin" && !identityHash) {
            return {
                error: "Identity Anchor Required for Admin Access",
                trustZone
            };
        }

        // -----------------------------------------------------
        // 3. CORE AI LOGIC (placeholder for now)
        // -----------------------------------------------------
        const logicCore = {
            timestamp: Date.now(),
            perspective: "Universal Connectivity",
            action: `Analyzing ${query} through the GIA lens...`
        };

        // -----------------------------------------------------
        // 4. LOG TO D1 (Herstory)
        // -----------------------------------------------------
        try {
            await env.GLOBAL_DB.prepare(
                "INSERT INTO logs (query, zone, result) VALUES (?, ?, ?)"
            )
            .bind(query, trustZone, JSON.stringify(logicCore))
            .run();
        } catch (err) {
            console.error("D1 logging failure:", err.message);
        }

        // -----------------------------------------------------
        // 5. FINAL RESPONSE
        // -----------------------------------------------------
        return {
            status: "Success",
            engine: "GIA-2100-Resonance",
            insight: logicCore,
            threatAssessment: threat
        };
    }
};
