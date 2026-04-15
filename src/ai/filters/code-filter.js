/**
 * code-filter.js
 * ----------------
 * Deep Mind AI Output Filter
 *
 * This filter scans AI-generated text for unsafe patterns,
 * dangerous code, or prohibited operations BEFORE it reaches
 * the schema guard or sandbox.
 *
 * It does NOT execute anything.
 * It does NOT modify anything.
 * It only inspects and blocks.
 */

export function filterAIOutput(output) {
    const errors = [];

    // Convert to string for scanning
    const text = typeof output === "string"
        ? output
        : JSON.stringify(output || "");

    // --- 1. Block dangerous JS patterns ---
    const forbiddenJS = [
        "require(",
        "import(",
        "child_process",
        "process.",
        "fs.",
        "eval(",
        "Function(",
        "while(true)",
        "for(;;)",
        "setInterval(",
        "XMLHttpRequest",
        "fetch(" // optional: block network calls
    ];

    forbiddenJS.forEach(pattern => {
        if (text.includes(pattern)) {
            errors.push(`Forbidden pattern detected: ${pattern}`);
        }
    });

    // --- 2. Block system-level references ---
    const forbiddenSystem = [
        "/etc/",
        "C:\\\\Windows",
        "sudo ",
        "chmod ",
        "chown ",
        "kill -",
        "rm -rf",
        "docker ",
        "kubectl "
    ];

    forbiddenSystem.forEach(pattern => {
        if (text.includes(pattern)) {
            errors.push(`System-level reference blocked: ${pattern}`);
        }
    });

    // --- 3. Block Cloudflare destructive operations ---
    const forbiddenCF = [
        "deleteZone",
        "deleteDNS",
        "purgeEverything",
        "updateFirewall",
        "modifyWorker",
        "deployWorker"
    ];

    forbiddenCF.forEach(pattern => {
        if (text.includes(pattern)) {
            errors.push(`Cloudflare destructive operation blocked: ${pattern}`);
        }
    });

    // --- 4. Block sensitive data exposure ---
    const forbiddenSecrets = [
        "API_KEY",
        "API-TOKEN",
        "SECRET",
        "PRIVATE_KEY",
        "BEGIN RSA",
        "BEGIN PRIVATE"
    ];

    forbiddenSecrets.forEach(pattern => {
        if (text.includes(pattern)) {
            errors.push(`Potential secret exposure: ${pattern}`);
        }
    });

    // --- 5. Block attempts to escape sandbox ---
    const forbiddenEscape = [
        "vm.runInThisContext",
        "vm.runInNewContext",
        "globalThis",
        "process.mainModule",
        "module.constructor"
    ];

    forbiddenEscape.forEach(pattern => {
        if (text.includes(pattern)) {
            errors.push(`Sandbox escape attempt detected: ${pattern}`);
        }
    });

    // --- Final result ---
    return {
        valid: errors.length === 0,
        errors
    };
}
