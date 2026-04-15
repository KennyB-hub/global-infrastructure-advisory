/**
 * after-execution.js
 * --------------------
 * Runs AFTER any workflow completes.
 * Used for logging, training signals, and output normalization.
 */

export function afterExecution(input, output) {
    const timestamp = Date.now();

    const auditRecord = {
        event: "workflow_complete",
        workflow: input.workflow || "default",
        trustZone: input.trustZone || "public",
        timestamp,
        outputPreview: summarize(output)
    };

    return auditRecord;
}

// Summarize output for logs without exposing sensitive data
function summarize(output) {
    if (!output) return "No output.";

    const clone = JSON.parse(JSON.stringify(output));

    // Remove large or sensitive fields
    if (clone.code) clone.code = "[CODE BLOCK REDACTED]";
    if (clone.metadata) delete clone.metadata.internal;

    return clone;
}
