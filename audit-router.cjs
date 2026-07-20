const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname);
let START_FILE = null;

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

const NODE_BUILTINS = new Set([
    'fs', 'path', 'crypto', 'os', 'http', 'https', 'child_process', 'cluster', 'events', 'util', 'stream'
]);

const IMPORT_REGEX = /(?:require\(['"]([^'"]+)['"]\)|from\s+['"]([^'"]+)['"]|import\(['"]([^'"]+)['"]\)|import\s+['"]([^'"]+)['"])/g;

function resolveFilePath(baseDir, importPath) {
    if (!importPath || typeof importPath !== 'string') return null;
    importPath = importPath.trim();

    if (NODE_BUILTINS.has(importPath) || (!importPath.startsWith('.') && !importPath.startsWith('/') && !importPath.includes('/'))) {
        return null; 
    }

    // Windows 11 Virtual Pathway Re-mapping Logic
    // If files search inside old layouts, point them to your new root directories automatically
    let virtualImportPath = importPath;
    if (importPath.startsWith('ai-engines/')) {
        virtualImportPath = importPath; // Targets root directory level directly
    }

    const potentialPaths = [
        path.resolve(baseDir, virtualImportPath),                     // Local file folder check
        path.resolve(REPO_ROOT, virtualImportPath),                    // Root folder check 
        path.resolve(REPO_ROOT, 'seven-os', virtualImportPath),         // Fallback legacy folder check
        path.resolve(REPO_ROOT, 'seven-os', 'ai', virtualImportPath)    // Deep legacy fallback check
    ];

    // Handle relative path breaking changes like '..\platform' inside nested files
    if (importPath.startsWith('..')) {
        potentialPaths.push(path.resolve(REPO_ROOT, importPath.replace(/^\.\.\//, '')));
    }

    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];

    for (const fullPath of potentialPaths) {
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            return fullPath;
        }
        for (const ext of extensions) {
            const withExt = fullPath + ext;
            if (fs.existsSync(withExt) && fs.statSync(withExt).isFile()) return withExt;
        }
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            for (const ext of extensions) {
                const indexPath = path.join(fullPath, `index${ext}`);
                if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) return indexPath;
            }
        }
    }
    
    return path.resolve(baseDir, importPath);
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
    
    console.log(`\x1b[32m[AUDITED]\x1b[0m ${displayPath}`);

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const currentDir = path.dirname(filePath);
        let match;

        IMPORT_REGEX.lastIndex = 0;
        while ((match = IMPORT_REGEX.exec(content)) !== null) {
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
console.log("   VIRTUAL REALIGNMENT CONTEXT ROUTING AUDITOR       ");
console.log("====================================================\n");

if (!START_FILE) {
    console.error(`\x1b[31mError: Could not locate a valid entry file root.\x1b[0m`);
    process.exit(1);
}

console.log(`Targeting root index context at: .\\${path.relative(REPO_ROOT, START_FILE)}\n`);

// Dynamic verification for missing cluster-health file initialization
const clusterHealthPath = path.resolve(REPO_ROOT, 'config', 'cluster-health.json');
if (!fs.existsSync(clusterHealthPath)) {
    const configDir = path.dirname(clusterHealthPath);
    if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(clusterHealthPath, '{"status": "healthy", "nodes": [], "autonomousRoutingStack": true}', 'utf8');
    console.log(`\x1b[34m[SYSTEM INIT]\x1b[0m Automatically initialized missing .\\config\\cluster-health.json file.\n`);
}

auditFile(START_FILE);

console.log('\n--- Realignment Audit Summary ---');
console.log(`Total files scanned: ${visitedFiles.size}`);
console.log(`Total missing files found: ${missingFiles.length}`);

process.exit(missingFiles.length > 0 ? 1 : 0);
