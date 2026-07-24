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

function resolveFilePath(baseDir, importPath) {
    if (!importPath || typeof importPath !== 'string') return null;
    importPath = importPath.trim();

    // Ignore node core modules and standard npm packages
    if (NODE_BUILTINS.has(importPath) || (!importPath.startsWith('.') && !importPath.startsWith('/') && !importPath.includes('/') && !importPath.startsWith('@'))) {
        return null; 
    }

    // Comprehensive Path Alias Resolution Matrix
    let virtualImportPath = importPath;
    if (importPath.startsWith('@seven-os/')) virtualImportPath = importPath.replace('@seven-os/', 'seven-os/');
    if (importPath.startsWith('@ai-engines/')) virtualImportPath = importPath.replace('@ai-engines/', 'ai-engines/');
    if (importPath.startsWith('@autonomous/')) virtualImportPath = importPath.replace('@autonomous/', 'autonomous/');
    if (importPath.startsWith('@runtime/')) virtualImportPath = importPath.replace('@runtime/', 'seven-runtime/');
    if (importPath.startsWith('@proprietary-cli/')) virtualImportPath = importPath.replace('@proprietary-cli/', 'proprietary-cli/');
    if (importPath.startsWith('@scripts/')) virtualImportPath = importPath.replace('@scripts/', 'scripts/');

    const potentialPaths = [
        path.resolve(baseDir, virtualImportPath),                     
        path.resolve(REPO_ROOT, virtualImportPath),                    
        path.resolve(REPO_ROOT, 'seven-os', virtualImportPath),
        path.resolve(REPO_ROOT, 'proprietary-cli', virtualImportPath),
        path.resolve(REPO_ROOT, 'scripts', virtualImportPath)
    ];

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

function extractImports(content) {
    const foundPaths = [];
    // Broad parser catching single quotes, double quotes, and backticks across formatting splits
    const patterns = [
        /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
        /from\s*['"`]([^'"`]+)['"`]/g,
        /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
        /import\s+['"`]([^'"`]+)['"`]/g
    ];

    for (const pattern of patterns) {
        let match;
        pattern.lastIndex = 0;
        while ((match = pattern.exec(content)) !== null) {
            if (match[1]) foundPaths.push(match[1]);
        }
    }
    return foundPaths;
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
    
    if (lowerPath.includes('proprietary-cli')) {
        console.log(`\x1b[33m[PROPRIETARY CLI]\x1b[0m ${displayPath}`);
    } else if (lowerPath.includes('scripts')) {
        console.log(`\x1b[34m[AUTOMATION SCRIPT]\x1b[0m ${displayPath}`);
    } else if (lowerPath.includes('ai-router') || lowerPath.includes('autonomous')) {
        console.log(`\x1b[35m[AI / AUTONOMOUS STACK]\x1b[0m ${displayPath}`);
    } else {
        console.log(`\x1b[32m[AUDITED]\x1b[0m ${displayPath}`);
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const currentDir = path.dirname(filePath);
        const importedPaths = extractImports(content);

        for (const importPath of importedPaths) {
            const resolvedPath = resolveFilePath(currentDir, importPath);
            if (resolvedPath) {
                auditFile(resolvedPath, filePath);
            }
        }
    } catch (err) {
        console.log(`\x1b[33m[WARN]\x1b[0m Failed parsing ${displayPath}: ${err.message}`);
    }
}

console.log("====================================================");
console.log("   DEEP-STACK RECOGNITION CONTEXT ROUTING AUDITOR   ");
console.log("====================================================\n");

if (!START_FILE) {
    console.error(`\x1b[31mError: Could not locate a valid entry file root.\x1b[0m`);
    process.exit(1);
}

console.log(`Targeting full routing stack index at: .\\${path.relative(REPO_ROOT, START_FILE)}\n`);
auditFile(START_FILE);

console.log('\n--- Deep Stack Audit Summary ---');
console.log(`Total files scanned: ${visitedFiles.size}`);
console.log(`Total missing files found: ${missingFiles.length}`);

process.exit(missingFiles.length > 0 ? 1 : 0);
