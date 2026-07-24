const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname);
let START_FILE = null;

// Primary entry file discovery array
const possibleEntries = [
    path.join(REPO_ROOT, 'seven-os', 'index.js'),
    path.join(REPO_ROOT, 'seven-os', 'index.ts'),
    path.join(REPO_ROOT, 'index.js'),
    path.join(REPO_ROOT, 'index.ts')
];

for (const entry of possibleEntries) {
    if (fs.existsSync(entry)) {
        START_FILE = entry;
        break;
    }
}

const visitedFiles = new Set();
const missingFiles = [];

// Advanced RegExp mapping capturing all core import formats, including absolute route aliases
const IMPORT_REGEX = /(?:require\(['"](.+?)['"]\)|from\s+['"](.+?)['"]|import\(['"](.+?)['"]\)|import\s+['"](.+?)['"])/g;

function resolveFilePath(baseDir, importPath) {
    if (!importPath || typeof importPath !== 'string') return null;

    const potentialPaths = [];

    // 1. Resolve standard relative paths
    if (importPath.startsWith('.') || importPath.startsWith('/')) {
        potentialPaths.push(path.resolve(baseDir, importPath));
    } else {
        // 2. Resolve root-level structural layouts (autonomous, backend, seven-runtime, seven-os modules)
        potentialPaths.push(path.resolve(REPO_ROOT, importPath));
        potentialPaths.push(path.resolve(REPO_ROOT, 'seven-os', importPath));
    }

    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];

    for (const fullPath of potentialPaths) {
        // Direct file matching layer
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            return fullPath;
        }
        // File extension checking layer
        for (const ext of extensions) {
            const withExt = fullPath + ext;
            if (fs.existsSync(withExt) && fs.statSync(withExt).isFile()) return withExt;
        }
        // Index folder resolution fallback engine
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            for (const ext of extensions) {
                const indexPath = path.join(fullPath, `index${ext}`);
                if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) return indexPath;
            }
        }
    }
    
    // Return relative resolution fallback to catch missing paths
    return importPath.startsWith('.') || importPath.startsWith('/') 
        ? path.resolve(baseDir, importPath) 
        : path.resolve(REPO_ROOT, importPath);
}

function auditFile(filePath, importedFrom = 'Root') {
    if (visitedFiles.has(filePath)) return;
    
    if (!fs.existsSync(filePath)) {
        missingFiles.push({ missing: filePath, from: importedFrom });
        console.log(`\x1b[31m[MISSING]\x1b[0m ${path.relative(REPO_ROOT, filePath)}\n          (imported from ${path.relative(REPO_ROOT, importedFrom)})\n`);
        return;
    }

    visitedFiles.add(filePath);
    const displayPath = path.relative(REPO_ROOT, filePath);
    const lowerPath = filePath.toLowerCase();
    
    // Custom terminal color codes for your specific architectural pipelines
    if (lowerPath.includes('ai-router') || lowerPath.includes('autonomous')) {
        console.log(`\x1b[35m[AI / AUTONOMOUS STACK]\x1b[0m ${displayPath}`);
    } else if (lowerPath.includes('seven-runtime') || lowerPath.includes('seven-stack')) {
        console.log(`\x1b[36m[RUNTIME ENGINE]\x1b[0m ${displayPath}`);
    } else if (lowerPath.includes('backend')) {
        console.log(`\x1b[34m[BACKEND CORE]\x1b[0m ${displayPath}`);
    } else {
        console.log(`\x1b[32m[AUDITED]\x1b[0m ${displayPath}`);
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const currentDir = path.dirname(filePath);
        let match;

        IMPORT_REGEX.lastIndex = 0;
        while ((match = IMPORT_REGEX.exec(content)) !== null) {
            // Safe filter to check position slots (1, 2, 3, or 4) based on regex capture rules
            const importPath = match[1] || match[2] || match[3] || match[4];
            
            if (importPath) {
                const resolvedPath = resolveFilePath(currentDir, importPath);
                if (resolvedPath) {
                    auditFile(resolvedPath, filePath);
                }
            }
        }
    } catch (err) {
        console.log(`\x1b[33m[WARN]\x1b[0m Failed parsing ${displayPath}: ${err.message}`);
    }
}

console.log("====================================================");
console.log("     SEVEN-OS DEEP INTEGRATION MULTI-INDEX AUDITOR  ");
console.log("====================================================\n");

if (!START_FILE) {
    console.error(`\x1b[31mError: Could not locate a valid entry file root.\x1b[0m`);
    process.exit(1);
}

console.log(`Targeting root index context at: .\\${path.relative(REPO_ROOT, START_FILE)}\n`);
auditFile(START_FILE);

console.log('\n--- Realignment Audit Summary ---');
console.log(`Total files scanned: ${visitedFiles.size}`);
console.log(`Total missing files found: ${missingFiles.length}`);

process.exit(missingFiles.length > 0 ? 1 : 0);
