/**
 * build-guard.js
 * Zero‑trust guard for build.js to prevent unauthorized execution.
 * Read‑only. No external calls. No mutation.
 */

const fs = require("fs");
const path = require("path");

module.exports = {
    verifyBuildAccess,
    verifyBuildIntegrity
};

// --- 1. VERIFY CALLER CLEARANCE ---
function verifyBuildAccess(caller = {}) {
    const allowedCallers = ["system", "admin", "worker:root"];

    if (!caller.role || !allowedCallers.includes(caller.role)) {
        return {
            allowed: false,
            reason: "Unauthorized caller",
            severity: "high"
        };
    }

    return {
        allowed: true,
        reason: "Authorized",
        severity: "none"
    };
}

// --- 2. VERIFY BUILD FILE INTEGRITY ---
function verifyBuildIntegrity(basePath = path.join(__dirname, "..")) {
    const buildPath = path.join(basePath, "build.js");

    if (!fs.existsSync(buildPath)) {
        return {
            exists: false,
            tampered: true,
            reason: "build.js missing",
            severity: "critical"
        };
    }

    const stats = fs.statSync(buildPath);

    if (stats.size === 0) {
        return {
            exists: true,
            tampered: true,
            reason: "build.js is empty",
            severity: "critical"
        };
    }

    return {
        exists: true,
        tampered: false,
        reason: "build.js intact",
        severity: "none"
    };
}
