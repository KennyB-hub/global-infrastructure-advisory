const fs = require('fs');
const path = require('path');
const Module = require('module');

const REPO_ROOT = path.resolve(__dirname);
const SEVEN_OS = path.join(REPO_ROOT, 'seven-os');
const RUNTIME = path.join(SEVEN_OS, 'seven-runtime');
const originalResolveFilename = Module._resolveFilename;

// Comprehensive workspace mapping targets
const ARCHITECTURE_DOMAINS = [
    path.join(SEVEN_OS, 'ai'),
    path.join(SEVEN_OS, 'ai/engines'),
    path.join(SEVEN_OS, 'ai/policy-packs'),
    path.join(SEVEN_OS, 'ai/config'),
    path.join(SEVEN_OS, 'engines'),
    path.join(SEVEN_OS, 'autonomous'),
    path.join(SEVEN_OS, 'security'),
    path.join(SEVEN_OS, 'system'),
    path.join(SEVEN_OS, 'system/security'),
    path.join(SEVEN_OS, 'system/cyber'),
    path.join(SEVEN_OS, 'system/voice'),
    path.join(SEVEN_OS, 'system/api'),
    path.join(SEVEN_OS, 'backend'),
    path.join(SEVEN_OS, 'backend/security'),
    path.join(SEVEN_OS, 'backend/system/identity'),
    path.join(SEVEN_OS, 'backend/system/mcp'),
    path.join(SEVEN_OS, 'functions/api'),
    path.join(SEVEN_OS, 'workers'),
    path.join(SEVEN_OS, 'templates'),
    path.join(SEVEN_OS, 'policy-packs'),
    path.join(SEVEN_OS, 'core'),
    path.join(RUNTIME),
    path.join(RUNTIME, 'core'),
    path.join(RUNTIME, 'drone'),
    path.join(REPO_ROOT, 'proprietary-cli'),
    path.join(REPO_ROOT, 'config')
];

Module._resolveFilename = function (request, parent, isMain, options) {
    let modifiedRequest = request;

    // 1. MACRO REPAIR: Map all legacy 'src/' path requests directly to your new 'seven-os' folder layout
    if (request.startsWith('src/')) {
        modifiedRequest = path.resolve(REPO_ROOT, request.replace(/^src\//, 'seven-os/'));
    }

    // 2. Unify naming variations (engine or autonomous -> ai)
    if (request.includes('autonomous/') || request.includes('engines/')) {
        modifiedRequest = request.replace(/engine[s]?\//, 'ai/');
    }

    // 3. Resolve local relative api-hooks jumps (matching '../api')
    if (request === '../api' && parent && parent.id.includes('hooks')) {
        const fallbackApiFile = path.join(SEVEN_OS, 'functions/api/[[path]].js');
        if (fs.existsSync(fallbackApiFile)) return fallbackApiFile;
    }

    // 4. Flatten seven-os redundant path loops
    if (request.includes('seven-os/')) {
        const baseName = path.basename(request);
        for (const dir of ARCHITECTURE_DOMAINS) {
            const checkFile = path.join(dir, baseName);
            if (fs.existsSync(checkFile)) return checkFile;
            for (const ext of ['.ts', '.js', '.json']) {
                if (fs.existsSync(checkFile + ext)) return checkFile + ext;
            }
        }
    }

    // 5. Global fallback resolution matrix loop
    try {
        return originalResolveFilename.call(this, modifiedRequest, parent, isMain, options);
    } catch (err) {
        const baseName = path.basename(modifiedRequest);
        const extensions = ['.ts', '.js', '.json', '.jsx', '.tsx'];

        for (const dir of ARCHITECTURE_DOMAINS) {
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

console.log("[\x1b[32mSECURE\x1b[0m] Legacy 'src' To 'seven-os' Translation Layer Active.");
