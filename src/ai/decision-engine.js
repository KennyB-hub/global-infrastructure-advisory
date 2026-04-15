/**
 * Decision Engine
 * ----------------
 * Core routing logic for Deep Mind AI.
 * Decides which workflow, policy, or tool to use based on input.
 * Enforces safety, trust boundaries, and human-in-the-loop rules.
 */

import { validateAIOutput } from "./validation/schema-guard.js";
import workflows from "./workflow/index.js";
import policies from "./policies/index.js";
import tools from "./tools/index.js";

export async function runDecisionEngine(input) {
    const log = (...args) => console.log("[DECISION]", ...args);

    log("Received input:", input);

    // --- 1. Validate input structure ---
    if (!input || typeof input !== "object") {
        return {
            error: "Invalid input format. Expected an object.",
            trustZone: "public"
        };
    }

    // --- 2. Determine trust zone ---
    const trustZone = input.trustZone || "public";
    log("Trust zone:", trustZone);

    // --- 3. Apply policy rules ---
    const policy = policies[trustZone];
    if (!policy) {
        return {
            error: `No policy defined for trust zone: ${trustZone}`,
            trustZone
        };
    }

    log("Applying policy:", policy.name);

    const policyCheck = policy.validate(input);
    if (!policyCheck.valid) {
        return {
            error: "Policy violation",
            details: policyCheck.errors,
            trustZone
        };
    }

    // --- 4. Select workflow ---
    const workflowName = input.workflow || "default";
    const workflow = workflows[workflowName];

    if (!workflow) {
        return {
            error: `Workflow '${workflowName}' not found.`,
            trustZone
        };
    }

    log("Selected workflow:", workflowName);

    // --- 5. Execute workflow (safe, no code execution) ---
    let result;
    try {
        result = await workflow.run(input, tools);
    } catch (err) {
        return {
            error: "Workflow execution failed",
            details: err.message,
            trustZone
        };
    }

    // --- 6. Validate AI output with schema guard ---
    const validation = validateAIOutput(result);

    if (!validation.valid) {
        return {
            error: "Schema validation failed",
            details: validation.errors,
            trustZone
        };
    }

    // --- 7. Return safe, validated output ---
    log("Decision engine completed successfully.");
    return {
        success: true,
        output: result,
        trustZone
    };
}
