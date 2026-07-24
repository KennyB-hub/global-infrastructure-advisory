const fs = require('fs');
const path = require('path');
const Module = require('module');

const REPO_ROOT = path.resolve(__dirname);
const SEVEN_OS = path.join(REPO_ROOT, 'seven-os');
const RUNTIME = path.join(SEVEN_OS, 'seven-runtime');
const BACKEND = path.join(SEVEN_OS, 'backend');
const originalResolveFilename = Module._resolveFilename;

// Comprehensive lookup matrix mapping every target post-autosorter directory domain
const MASTER_DOMAINS = [
    path.join(SEVEN_OS, 'ai'),
    path.join(SEVEN_OS, 'ai/engines'),
    path.join(SEVEN_OS, 'ai/policy-packs'),
    path.join(SEVEN_OS, 'ai/config'),
    path.join(SEVEN_OS, 'engines'),
    path.join(SEVEN_OS, 'security'),
    path.join(SEVEN_OS, 'system'),
    path.join(SEVEN_OS, 'system/security'),
    path.join(SEVEN_OS, 'system/cyber'),
    path.join(SEVEN_OS, 'system/voice'),
    path.join(SEVEN_OS, 'system/api'),
    path.join(BACKEND),
    path.join(BACKEND, 'security'),
    path.join(BACKEND, 'security/tools'),
    path.join(BACKEND, 'infrastructure'),
    path.join(BACKEND, 'infrastructure/utils'),
    path.join(BACKEND, 'threat'),
    path.join(BACKEND, 'system/identity'),
    path.join(BACKEND, 'system/mcp'),
    path.join(BACKEND, 'utilities'),
    path.join(BACKEND, 'utilities/context'),
    path.join(BACKEND, 'utilities/geo'),
    path.join(BACKEND, 'utilities/geomapping-logic'),
    path.join(BACKEND, 'utilities/integrity'),
    path.join(BACKEND, 'worker/system-workers'),
    path.join(SEVEN_OS, 'functions/api'),
    path.join(SEVEN_OS, 'workers'),
    path.join(SEVEN_OS, 'templates'),
    path.join(RUNTIME),
    path.join(RUNTIME, 'core'),
    path.join(RUNTIME, 'drone'),
    path.join(REPO_ROOT, 'ai-engines/utils'),
    path.join(REPO_ROOT, 'config')
];

Module._resolveFilename = function (request, parent, isMain, options) {
    let modifiedRequest = request;

    // 1. Instantly repair legacy spelling drift and typo lookups inside strings
    if (request.includes('worker-gauard')) modifiedRequest = request.replace('worker-gauard', 'worker-guard');
    if (request.includes('surch')) modifiedRequest = request.replace('surch', 'search');
    if (request.includes('..backend/')) modifiedRequest = request.replace('..backend/', '../backend/');
    if (request.startsWith('src/backend/')) modifiedRequest = request.replace('src/backend/', 'backend/');

    // 2. Unify naming variations (ai-engine or ai-engines -> ai)
    if (request.includes('ai-engine/') || request.includes('ai-engines/')) {
        modifiedRequest = request.replace(/ai-engine[s]?\//, 'ai/');
    }

    // 3. Intercept local frontend relative api-hooks jumps (matching '../api')
    if (request === '../api' && parent && parent.id.includes('hooks')) {
        const fallbackApiFile = path.join(SEVEN_OS, 'functions/api/[[path]].js');
        if (fs.existsSync(fallbackApiFile)) return fallbackApiFile;
    }

    // 4. Flatten seven-os redundant path loops
    if (request.includes('seven-os/')) {
        const baseName = path.basename(request);
        for (const dir of MASTER_DOMAINS) {
            const checkFile = path.join(dir, baseName);
            if (fs.existsSync(checkFile)) return checkFile;
            for (const ext of ['.ts', '.js', '.json']) {
                if (fs.existsSync(checkFile + ext)) return checkFile + ext;
            }
        }
    }

    // 5. Global fallback trace registry loop
    try {
        return originalResolveFilename.call(this, modifiedRequest, parent, isMain, options);
    } catch (err) {
        const baseName = path.basename(modifiedRequest);
        const extensions = ['.ts', '.js', '.json', '.jsx', '.tsx'];

        for (const dir of MASTER_DOMAINS) {
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

console.log("[\x1b[32mSECURE\x1b[0m] Ultimate Resilient Interceptor Suite Core Online.");
