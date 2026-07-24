const fs = require('fs');
const path = require('path');
const Module = require('module');

const REPO_ROOT = path.resolve(__dirname);
const SEVEN_OS = path.join(REPO_ROOT, 'seven-os');
const originalResolveFilename = Module._resolveFilename;

const GLOBAL_DOMAINS = [
    path.join(SEVEN_OS, 'ai'),
    path.join(SEVEN_OS, 'ai/policy-packs'),
    path.join(SEVEN_OS, 'engines'),
    path.join(SEVEN_OS, 'security'),
    path.join(SEVEN_OS, 'system'),
    path.join(SEVEN_OS, 'system/cyber'),
    path.join(SEVEN_OS, 'backend'),
    path.join(SEVEN_OS, 'autonomous'),
    path.join(SEVEN_OS, 'workers'),
    path.join(SEVEN_OS, 'templates'),
    path.join(SEVEN_OS, 'seven-runtime'),
    path.join(SEVEN_OS, 'seven-runtime/core'),
    path.join(SEVEN_OS, 'seven-runtime/drone'),
    path.join(SEVEN_OS, 'seven-runtime/safety'),
    path.join(REPO_ROOT, 'engines/utils'),
    path.join(REPO_ROOT, 'config')
];

Module._resolveFilename = function (request, parent, isMain, options) {
    let modifiedRequest = request;

    // 1. Intercept hardcoded external or namespaced mocks like @voxel-dot-ai
    if (request.startsWith('@voxel-dot-ai/')) {
        return path.join(SEVEN_OS, 'seven-runtime/drone/mavsdk-mock.ts');
    }

    // 2. Unify naming variations (autonomous and engines -> ai)
    if (request.includes('engine/') || request.includes('autonomous/')) {
        modifiedRequest = request.replace(/autonomous[s]?\//, 'ai/');
    }

    // 3. Flatten seven-os redundant path loops
    if (request.includes('seven-os/')) {
        const baseName = path.basename(request);
        for (const dir of GLOBAL_DOMAINS) {
            const checkFile = path.join(dir, baseName);
            if (fs.existsSync(checkFile)) return checkFile;
            for (const ext of ['.ts', '.js', '.json']) {
                if (fs.existsSync(checkFile + ext)) return checkFile + ext;
            }
        }
    }

    // 4. Global Lookups across all system registries
    try {
        return originalResolveFilename.call(this, modifiedRequest, parent, isMain, options);
    } catch (err) {
        const baseName = path.basename(modifiedRequest);
        const extensions = ['.ts', '.js', '.json', '.jsx', '.tsx'];

        for (const dir of GLOBAL_DOMAINS) {
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

console.log("[\x1b[32mSECURE\x1b[0m] Enterprise Runtime & Swarm Control Mapping Matrix Active.");
