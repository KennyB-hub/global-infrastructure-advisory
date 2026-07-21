const fs = require('fs');
const path = require('path');
const Module = require('module');

const REPO_ROOT = path.resolve(__dirname);
const SEVEN_OS = path.join(REPO_ROOT, 'seven-os');
const RUNTIME = path.join(SEVEN_OS, 'seven-runtime');
const PROPRIETARY_CLI = path.join(REPO_ROOT, 'proprietary-cli');
const UNIVERSAL_DASHBOARD = path.join(RUNTIME, 'dashboards/universal');
const originalResolveFilename = Module._resolveFilename;

// Unified infrastructure domain registry tracking your post-autosort folder depth shifts
const ULTIMATE_INFRA_DOMAINS = [
    path.join(SEVEN_OS, 'engines'),                                    // Your active engines location
    PROPRIETARY_CLI,                                                   // Your active ts-loader location
    path.join(SEVEN_OS, 'config'),
    path.join(SEVEN_OS, 'system/db'),
    path.join(SEVEN_OS, 'system/cyber'),
    path.join(SEVEN_OS, 'system'),
    path.join(SEVEN_OS, 'system/security'),
    path.join(SEVEN_OS, 'system/engines'),
    path.join(SEVEN_OS, 'system/api'),
    path.join(REPO_ROOT, 'data'),
    path.join(SEVEN_OS, 'ai'),
    path.join(SEVEN_OS, 'autonomous'),
    path.join(SEVEN_OS, 'sector'),
    path.join(SEVEN_OS, 'engines'),
    path.join(SEVEN_OS, 'policy-packs'),
    path.join(SEVEN_OS, 'config'),
    path.join(SEVEN_OS, 'security'),
    path.join(SEVEN_OS, 'backend'),
    path.join(SEVEN_OS, 'backend/security'),
    path.join(SEVEN_OS, 'backend/system/identity'),
    path.join(SEVEN_OS, 'backend/system/mcp'),
    path.join(SEVEN_OS, 'backend/utils'),
    path.join(SEVEN_OS, 'backend/hubs-logic'),
    path.join(SEVEN_OS, 'functions/api'),
    path.join(SEVEN_OS, 'workers'),
    path.join(SEVEN_OS, 'workers/system'),
    path.join(SEVEN_OS, 'templates'),
    path.join(SEVEN_OS, 'policy-packs'),
    path.join(SEVEN_OS, 'cli'),
    path.join(SEVEN_OS, 'core'),
    path.join(RUNTIME),
    path.join(RUNTIME, 'core'),
    path.join(RUNTIME, 'drone'),
    path.join(RUNTIME, 'sync'),
    path.join(RUNTIME, 'sync/policies'),
    path.join(RUNTIME, 'sync/transports'),
    path.join(RUNTIME, 'safety'),
    path.join(RUNTIME, 'analysis'),
    path.join(RUNTIME, 'publisher'),
    path.join(UNIVERSAL_DASHBOARD),
    path.join(UNIVERSAL_DASHBOARD, 'layouts'),
    path.join(UNIVERSAL_DASHBOARD, 'themes'),
    path.join(RUNTIME, 'types'),
    path.join(REPO_ROOT, 'ai-engines/utils'),
    path.join(REPO_ROOT, 'config/sovereign')
];

Module._resolveFilename = function (request, parent, isMain, options) {
    let modifiedRequest = request;

    // 1. SURGICAL REPAIR: Directly catch ts-loader targets and route to proprietary-cli
    if (request.includes('ts-loader')) {
        const proprietaryTsLoader = path.join(PROPRIETARY_CLI, 'ts-loader.js');
        if (fs.existsSync(proprietaryTsLoader)) return proprietaryTsLoader;
    }

    // 2. MACRO REPAIR: Map legacy 'src/' path requests directly to your new 'seven-os' layout
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

    // 4. Intercept your universal dashboard sibling lookups (types, themes, layouts)
    if (parent && parent.id.includes('universal')) {
        const baseName = path.basename(request);
        const extensions = ['.ts', '.js', '.json'];
        const checkLocations = [UNIVERSAL_DASHBOARD, path.join(UNIVERSAL_DASHBOARD, 'layouts'), path.join(UNIVERSAL_DASHBOARD, 'themes'), path.join(RUNTIME, 'types')];
        for (const loc of checkLocations) {
            const fileCheck = path.join(loc, baseName);
            if (fs.existsSync(fileCheck) && fs.statSync(fileCheck).isFile()) return fileCheck;
            for (const ext of extensions) { if (fs.existsSync(fileCheck + ext)) return fileCheck + ext; }
        }
    }

    // 5. Intercept platform engine references to math or sector engines
    if (request.includes('./engines/') && parent && parent.id.includes('platform')) {
        const baseName = path.basename(request);
        const engineCheck = path.join(SEVEN_OS, 'engines', baseName); 
        if (fs.existsSync(engineCheck)) return engineCheck;
        for (const ext of ['.ts', '.js', '.json']) { if (fs.existsSync(engineCheck + ext)) return engineCheck + ext; }
    }

    // 6. Intercept local frontend relative api-hooks jumps (matching '../api')
    if (request === '../api' && parent && parent.id.includes('hooks')) {
        const fallbackApiFile = path.join(SEVEN_OS, 'functions/api/[[path]].js');
        if (fs.existsSync(fallbackApiFile)) return fallbackApiFile;
    }

    // 7. Unify naming variations (autonomous or engines -> ai or engines)
    if (request.includes('ai-engine/') || request.includes('atonomous/')) {
        modifiedRequest = request.replace(/ai [s]?\//, 'engines/'); 
    }

    // 8. Flatten seven-os redundant path loops using synchronized array reference
    if (request.includes('seven-os/')) {
        const baseName = path.basename(request);
        for (const dir of ULTIMATE_INFRA_DOMAINS) {
            const checkFile = path.join(dir, baseName);
            if (fs.existsSync(checkFile)) return checkFile;
            for (const ext of ['.ts', '.js', '.json']) { if (fs.existsSync(checkFile + ext)) return checkFile + ext; }
        }
    }

    // 9. Global fallback resolution matrix loop
    try {
        return originalResolveFilename.call(this, modifiedRequest, parent, isMain, options);
    } catch (err) {
        const baseName = path.basename(modifiedRequest);
        const extensions = ['.ts', '.js', '.json', '.jsx', '.tsx'];

        for (const dir of ULTIMATE_INFRA_DOMAINS) {
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

console.log("[\x1b[32mSECURE\x1b[0m] Proprietary CLI Loader & Sector Engines Matrix Connected.");
