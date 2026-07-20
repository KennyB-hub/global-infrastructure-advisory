const fs = require('fs');
const path = require('path');
const Module = require('module');

const REPO_ROOT = path.resolve(__dirname);
const SEVEN_OS = path.join(REPO_ROOT, 'seven-os');
const AUTONOMOUS = path.join(SEVEN_OS, 'autonomous');
const RUNTIME = path.join(SEVEN_OS, 'seven-runtime');
const originalResolveFilename = Module._resolveFilename;

// Comprehensive workspace mapping targets matching your physical folder array
const SYSTEM_WIDE_DOMAINS = [
    AUTONOMOUS,
    path.join(AUTONOMOUS, 'agents'),
    path.join(AUTONOMOUS, 'agents/tasks'),
    path.join(AUTONOMOUS, 'core'),
    path.join(AUTONOMOUS, 'core/AI-workforce-sync-layer'),
    path.join(AUTONOMOUS, 'core/fcc'),
    path.join(AUTONOMOUS, 'governance-brain'),
    path.join(AUTONOMOUS, 'integrity'),
    path.join(AUTONOMOUS, 'route'),
    path.join(SEVEN_OS, 'config'),
    path.join(SEVEN_OS, 'system/db'),
    path.join(SEVEN_OS, 'system/cyber'),
    path.join(SEVEN_OS, 'system'),
    path.join(SEVEN_OS, 'system/security'),
    path.join(SEVEN_OS, 'system/engines'),
    path.join(SEVEN_OS, 'system/api'),
    path.join(SEVEN_OS, 'backend'),
    path.join(SEVEN_OS, 'backend/ai'),
    path.join(SEVEN_OS, 'backend/ai/tools'),
    path.join(SEVEN_OS, 'backend/ai/workflows'),
    path.join(SEVEN_OS, 'backend/security'),
    path.join(SEVEN_OS, 'backend/system/identity'),
    path.join(SEVEN_OS, 'backend/system/mcp'),
    path.join(SEVEN_OS, 'backend/utils'),
    path.join(SEVEN_OS, 'backend/hubs-logic'),
    path.join(SEVEN_OS, 'functions/api'),
    path.join(SEVEN_OS, 'workers'),
    path.join(SEVEN_OS, 'templates'),
    path.join(SEVEN_OS, 'policy-packs'),
    path.join(SEVEN_OS, 'cli'),
    path.join(SEVEN_OS, 'core'),
    path.join(REPO_ROOT, 'data'),
    path.join(RUNTIME),
    path.join(REPO_ROOT, 'ai-engines/utils'),
    path.join(REPO_ROOT, 'config/sovereign')
];

Module._resolveFilename = function (request, parent, isMain, options) {
    let modifiedRequest = request;

    // 1. MACRO REPAIR: Intercept and translate out-of-bounds autonomous sub-paths
    if (request.includes('autonomous/')) {
        const baseName = path.basename(request);
        for (const dir of SYSTEM_WIDE_DOMAINS) {
            if (dir.includes('autonomous')) {
                const checkFile = path.join(dir, baseName);
                if (fs.existsSync(checkFile)) return checkFile;
                for (const ext of ['.ts', '.js', '.json']) { if (fs.existsSync(checkFile + ext)) return checkFile + ext; }
            }
        }
    }

    // 2. Map legacy 'src/' path requests directly to your new 'seven-os' folder layout
    if (request.startsWith('src/')) {
        modifiedRequest = path.resolve(REPO_ROOT, request.replace(/^src\//, 'seven-os/'));
    }

    // 3. Map backend matching folder relative lookups targeting data straight to root level data
    if (request.includes('/data/') || request.startsWith('../data/')) {
        const baseName = path.basename(request);
        const rootDataCheck = path.join(REPO_ROOT, 'data', baseName);
        if (fs.existsSync(rootDataCheck)) return rootDataCheck;
        for (const ext of ['.ts', '.js', '.json']) { if (fs.existsSync(rootDataCheck + ext)) return rootDataCheck + ext; }
    }

    // 4. Unify naming variations (ai-engine or ai-engines -> ai or engines)
    if (request.includes('ai-engine/') || request.includes('ai-engines/')) {
        modifiedRequest = request.replace(/ai-engine[s]?\//, 'engines/'); 
    }

    // 5. Flatten seven-os redundant path loops
    if (request.includes('seven-os/')) {
        const baseName = path.basename(request);
        for (const dir of SYSTEM_WIDE_DOMAINS) {
            const checkFile = path.join(dir, baseName);
            if (fs.existsSync(checkFile)) return checkFile;
            for (const ext of ['.ts', '.js', '.json']) { if (fs.existsSync(checkFile + ext)) return checkFile + ext; }
        }
    }

    // 6. Global fallback resolution matrix loop
    try {
        return originalResolveFilename.call(this, modifiedRequest, parent, isMain, options);
    } catch (err) {
        const baseName = path.basename(modifiedRequest);
        const extensions = ['.ts', '.js', '.json', '.jsx', '.tsx'];

        for (const dir of SYSTEM_WIDE_DOMAINS) {
            const testPath = path.join(dir, baseName);
            if (fs.existsSync(testPath) && fs.statSync(testPath).isFile()) return testPath;
            
            for (const ext of extensions) {
                const withExt = testPath + ext;
                if (fs.existsSync(withExt) && fs.statSync(withExt).isFile()) return withExt;
            }

            if (fs.existsSync(testPath) && fs.statSync(testPath).isDirectory()) {
                for (const ext of extensions) {
                    const indexCheck = path.join(testPath, `index${ext}`);
                    if (fs.existsSync(indexCheck)) return indexCheck;
                }
            }
        }
        
        return originalResolveFilename.call(this, request, parent, isMain, options);
    }
};

console.log("[\x1b[32mSECURE\x1b[0m] Autonomous Agents & Serverless Backend Routing Matrix Connected.");
