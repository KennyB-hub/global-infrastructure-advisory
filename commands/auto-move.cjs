#!/usr/bin/env node

/**
 * Seven‑OS Runtime Auto‑Move Script
 * Moves any file containing "seven-runtime" into the correct /runtime/ folder.
 */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, "runtime");

const SUBFOLDERS = {
    ai: /ai|cortex|identity|logic-engine|schema-guard|workflows/i,
    context: /context/i,
    geo: /geo|mapping|normalize|region|lookup/i,
    infrastructure: /infrastructure|ingest|integrity|sensors|threat|scoring|matching/i,
    logs: /log-/i,
    policy: /policy/i,
    security: /auth|security|guard|key-engine/i,
    network: /routing-engine|network/i,
    rf: /rf/i,
    workforce: /workforce/i
};

function detectSubfolder(filename) {
    for (const [folder, pattern] of Object.entries(SUBFOLDERS)) {
        if (pattern.test(filename)) return folder;
    }
    return ""; // root of runtime
}

function rewriteImports(filePath) {
    let content = fs.readFileSync(filePath, "utf8");
    const updated = content.replace(/seven-runtime/g, "runtime");
    fs.writeFileSync(filePath, updated, "utf8");
}

function moveFile(oldPath) {
    const filename = path.basename(oldPath);
    const subfolder = detectSubfolder(filename);

    const targetDir = path.join(RUNTIME, subfolder);
    const newPath = path.join(targetDir, filename);

    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    fs.renameSync(oldPath, newPath);
    rewriteImports(newPath);

    console.log(`✔ Moved: ${oldPath} → ${newPath}`);
}

function scan(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scan(fullPath);
        } else {
            if (fullPath.includes("seven-runtime")) {
                moveFile(fullPath);
            }
        }
    }
}

console.log("🔍 Scanning for misplaced runtime files...");
scan(ROOT);
console.log("✅ Completed. All seven-runtime files moved into /runtime/");
