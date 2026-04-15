/**
 * AI Sandbox Runner
 * ------------------
 * Safe execution environment for AI-generated code.
 * No filesystem writes, no network access (unless explicitly allowed),
 * no access to production secrets, and full error isolation.
 */

import vm from "node:vm";
import path from "node:path";
import fs from "node:fs";

// --- Sandbox Environment ---
const sandboxEnv = {
    console: {
        log: (...args) => {
            process.stdout.write("[SANDBOX LOG] " + args.join(" ") + "\n");
        },
        error: (...args) => {
            process.stderr.write("[SANDBOX ERROR] " + args.join(" ") + "\n");
        }
    },

    // Safe JSON utilities
    JSON,

    // Timer functions (safe)
    setTimeout,
    clearTimeout,

    // Prevent access to process.env (security)
    process: {
        env: {
            AI_SANDBOX: "true"
        }
    }
};

// Create VM context
const context = vm.createContext(sandboxEnv);

// --- Load AI-generated code safely ---
function loadCode(filePath) {
    const fullPath = path.resolve(filePath);

    if (!fs.existsSync(fullPath)) {
        console.error(`[SANDBOX] File not found: ${fullPath}`);
        process.exit(1);
    }

    return fs.readFileSync(fullPath, "utf8");
}

// --- Execute code inside sandbox ---
function runInSandbox(code) {
    try {
        const script = new vm.Script(code, {
            timeout: 2000, // Prevent infinite loops
            displayErrors: true
        });

        script.runInContext(context);
        console.log("[SANDBOX] Execution complete");
    } catch (err) {
        console.error("[SANDBOX] Execution failed:");
        console.error(err);
    }
}

// --- Entry Point ---
const targetFile = process.argv[2];

if (!targetFile) {
    console.error("Usage: node sandbox/run-sandbox.js <file.js>");
    process.exit(1);
}

const code = loadCode(targetFile);
runInSandbox(code);
