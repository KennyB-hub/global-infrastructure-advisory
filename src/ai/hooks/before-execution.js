/**
 * before-execution.js
 * ---------------------
 * Runs BEFORE any workflow executes.
 * Used for logging, auditing, policy checks, and input normalization.
 */

export function beforeExecution(input) {
    const timestamp = Date.now();

    const auditRecord = {
        event: "workflow_start",
        workflow: input.workflow || "default",
        trustZone: input.trustZone || "public",
        timestamp,
        inputPreview: sanitize(input)
    };

    return auditRecord;
}

// Remove sensitive fields before logging
function sanitize(obj) {
    const clone = JSON.parse(JSON.stringify(obj || {}));

    const forbidden = ["apiKey", "token", "secret", "password"];

    forbidden.forEach(key => {
        if (clone[key]) clone[key] = "[REDACTED]";
    });

    return clone;
}
