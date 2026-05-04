/**
 * security-audit.js
 * Autonomous, read‑only security posture audit for a lights‑out platform.
 * No execution of external code. No mutation. No network calls.
 */

const fs = require("fs");
const path = require("path");

module.exports = {
    runSecurityAudit
};

function runSecurityAudit(basePath = path.join(__dirname, "..")) {
    const report = {
        timestamp: new Date().toISOString(),
        status: "OK",
        missingFiles: [],
        unexpectedFiles: [],
        integrity: [],
        aiCortex: [],
        workers: [],
        securityGuards: [],
        summary: {}
    };

    // --- EXPECTED SECURITY FILES ---
    const expectedSecurityFiles = [
        "validate-token.js",
        "middleware.js",
        "require-admin.js",
        "clearance-guard.js",
        "entra-guard.js",
        "worker-guard.js",
        "hash-utils.js",
        "key-engine.js",
        "otp-service.js",
        "security-audit.js" // itself
    ];

    const securityPath = path.join(basePath, "security");
    const aiPath = path.join(basePath, "ai");
    const workersPath = path.join(basePath, "workers");

    // --- 1. SECURITY FOLDER CHECK ---
    const securityFiles = safeReadDir(securityPath);

    expectedSecurityFiles.forEach(file => {
        if (!securityFiles.includes(file)) {
            report.missingFiles.push({
                file,
                location: "security",
                severity: "high"
            });
        }
    });

    securityFiles.forEach(file => {
        if (!expectedSecurityFiles.includes(file)) {
            report.unexpectedFiles.push({
                file,
                location: "security",
                severity: "medium"
            });
        }
    });

    // --- 2. AI CORTEX CHECK ---
    const expectedAI = [
        "cortex.js",
        "tools.js",
        "workflows.js",
        "schema-guard.js",
        "identity.js"
    ];

    const aiFiles = safeReadDir(aiPath);

    expectedAI.forEach(file => {
        if (!aiFiles.includes(file)) {
            report.aiCortex.push({
                file,
                issue: "missing",
                severity: "high"
            });
        }
    });

    // --- 3. WORKERS CHECK ---
    const expectedWorkers = [
        "routing.js",
        "protected-routes.js",
        "admin-endpoints.js",
        "heartbeat.js"
    ];

    const workerFiles = safeReadDir(workersPath);

    expectedWorkers.forEach(file => {
        if (!workerFiles.includes(file)) {
            report.workers.push({
                file,
                issue: "missing",
                severity: "medium"
            });
        }
    });

    // --- 4. INTEGRITY CHECK (HASH PRESENCE) ---
    expectedSecurityFiles.forEach(file => {
        const full = path.join(securityPath, file);
        if (fs.existsSync(full)) {
            const size = fs.statSync(full).size;
            report.integrity.push({
                file,
                size,
                status: size > 0 ? "OK" : "EMPTY"
            });
        }
    });

    // --- 5. SUMMARY ---
    report.summary = {
        missing: report.missingFiles.length,
        unexpected: report.unexpectedFiles.length,
        aiIssues: report.aiCortex.length,
        workerIssues: report.workers.length,
        integrityChecks: report.integrity.length
    };

    return report;
}

// --- SAFE DIRECTORY READER ---
function safeReadDir(dir) {
    try {
        return fs.readdirSync(dir).filter(f => !f.startsWith("."));
    } catch {
        return [];
    }
}
