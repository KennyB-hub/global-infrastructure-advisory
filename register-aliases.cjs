const fs = require('fs');
const path = require('path');
const Module = require('module');

const REPO_ROOT = path.resolve(__dirname);
const SEVEN_OS = path.join(REPO_ROOT, 'seven-os');
const RUNTIME = path.join(SEVEN_OS, 'seven-runtime');
const UNIVERSAL_DASHBOARD = path.join(RUNTIME, 'dashboards/universal');
const originalResolveFilename = Module._resolveFilename;

const SYSTEM_WIDE_DOMAINS = [
    path.join(SEVEN_OS, 'ai'),
    path.join(SEVEN_OS, 'ai/engines'),
    path.join(SEVEN_OS, 'ai/policy-packs'),
    path.join(SEVEN_OS, 'ai/config'),
    path.join(SEVEN_OS, 'autonomous'),
    path.join(SEVEN_OS, 'engines'),
    path.join(SEVEN_OS, 'security'),
    path.join(SEVEN_OS, 'system'),
    path.join(SEVEN_OS, 'system/engines'),
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
    path.join(REPO_ROOT, 'config')
];

Module._resolveFilename = function (request, parent, isMain, options) {
    let modifiedRequest = request;

    // 1. Intercept universal dashboard sibling lookups (e.g., matching types, themes, layouts)
    if (parent && parent.id.includes('universal')) {
        const baseName = path.basename(request);
        const extensions = ['.ts', '.js', '.json'];
        
        // Search directly within your universal dashboard folder boundaries
        const checkLocations = [
            UNIVERSAL_DASHBOARD,
            path.join(UNIVERSAL_DASHBOARD, 'layouts'),
            path.join(UNIVERSAL_DASHBOARD, 'themes'),
            path.join(RUNTIME, 'types')
        ];

        for (const loc of checkLocations) {
            const fileCheck = path.join(loc, baseName);
            if (fs.existsSync(fileCheck) && fs.statSync(fileCheck).isFile()) return fileCheck;
            for (const ext of extensions) {
                if (fs.existsSync(fileCheck + ext)) return fileCheck + ext;
            }
        }
    }

    // 2. Resolve namespaced mocks from voxel AI
    if (request.startsWith('@voxel-dot-ai/')) {
        return path.join(RUNTIME, 'drone/mavsdk-mock.ts');
    }

    // 3. Unify name variations (ai-engine or ai-engines -> ai)
    if (request.includes('ai-engine/') || request.includes('ai-engines/')) {
        modifiedRequest = request.replace(/ai-engine[s]?\//, 'ai/');
    }

    // 4. Resolve local relative api-hooks jumps (matching '../api')
    if (request === '../api' && parent && parent.id.includes('hooks')) {
        const fallbackApiFile = path.join(SEVEN_OS, 'functions/api/[[path]].js');
        if (fs.existsSync(fallbackApiFile)) return fallbackApiFile;
    }

    // 5. Flatten seven-os redundant path loops
    if (request.includes('seven-os/')) {
        const baseName = path.basename(request);
        for (const dir of SYSTEM_WIDE_DOMAINS) {
            const checkFile = path.join(dir, baseName);
            if (fs.existsSync(checkFile)) return checkFile;
            for (const ext of ['.ts', '.js', '.json']) {
                if (fs.existsSync(checkFile + ext)) return checkFile + ext;
            }
        }
    }

    // 6. Global fallback lookup loop
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

console.log("[\x1b[32mSECURE\x1b[0m] Universal Dashboard Layout Realignment Active.");
