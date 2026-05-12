/**
 * GIA v12 GOVERNOR & ORCHESTRATOR
 * Master Entrypoint for Sovereign Infrastructure
 */

import { runDecisionEngine } from "./ai-engine/decision-engine.js";
import tools from "./ai-engine/tools/index.js";
import policies from "./ai-engine/policies/index.js";
import workflows from "./ai-engine/workflow/index.js";
import { filterAIOutput } from "./ai-engine/filters/code-filter.js";
import { beforeExecution } from "./ai-engine/hooks/before-execution.js";
import { afterExecution } from "./ai-engine/hooks/after-execution.js";
import { validateAIOutput } from "./ai-engine/validation/schema-guard.js";
import { AutomationTasks } from './system/automation-tasks.js';
import { FailsafeProtocols } from './system/failsafe-protocols.js';

export default {
    // 1. THE HEARTBEAT (Autonomous Cron Trigger)
    async scheduled(event, env, ctx) {
        console.log("[GOVERNOR] Heartbeat Active: Initiating Diagnostics...");
        ctx.waitUntil(AutomationTasks.runDailyOps(env));
    },

    // 2. THE COMMAND INTERFACE (Main Gateway)
    async fetch(request, env) {
        const url = new URL(request.url);

        try {
            // --- ROUTING LAYER ---

            // AI / Deep Mind Telemetry Route
            if (url.pathname === "/api/deep-mind") {
                const input = await request.json();
                const aiResponse = await runAI(input, env);
                return new Response(JSON.stringify(aiResponse), {
                    status: aiResponse.error ? 400 : 200,
                    headers: { "Content-Type": "application/json" }
                });
            }

            // Default Governor Status Response
            return new Response("GIA v12 Governor Online | Sovereign Link: STABLE", {
                status: 200,
                headers: { "Content-Type": "text/plain" }
            });

        } catch (err) {
            console.error(`[GOVERNOR CRITICAL] ${err.message}`);
            // Auto-trigger Failsafe Protocol Alpha
            await FailsafeProtocols.execute('GLOBAL', 'GOVERNOR_FAULT', env);
            
            return new Response(JSON.stringify({ 
                error: "Governor Failure", 
                details: err.message, 
                status: "FAILSAFE_ACTIVE" 
            }), { 
                status: 500, 
                headers: { "Content-Type": "application/json" } 
            });
        }
    }
};

/**
 * CORE ORCHESTRATION LOGIC
 * Manages TrustZones and AI Lifecycle
 */
async function runAI(input, env) {
    const trustZone = input.trustZone || "public";

    // 1. Policy validation
    const policy = policies[trustZone];
    if (!policy) return { error: `Invalid TrustZone: ${trustZone}`, trustZone };

    const policyCheck = policy.validate(input);
    if (!policyCheck.valid) return { error: "Policy violation", details: policyCheck.errors };

    // 2. Lifecycle: Before Execution
    const startAudit = beforeExecution(input);

    // 3. Execution: Decision Engine
    const decisionResult = await runDecisionEngine({ ...input, trustZone, workflows, tools, env });
    if (decisionResult.error) return { ...decisionResult, audit: { start: startAudit } };

    const rawOutput = decisionResult.output;

    // 4. Security: Filter & Schema Guard
    if (!filterAIOutput(rawOutput).valid) return { error: "Output blocked by code filter" };
    if (!validateAIOutput(rawOutput).valid) return { error: "Schema validation failed" };

    // 5. Lifecycle: Complete Audit
    const endAudit = afterExecution(input, rawOutput);

    return {
        success: true,
        trustZone,
        output: rawOutput,
        audit: { start: startAudit, end: endAudit }
    };
}

