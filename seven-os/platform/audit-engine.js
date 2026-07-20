// audit-router.cjs

const fs = require('fs');
const path = require('path');

const APP_CONTEXT_DIR = path.resolve(__dirname, 'seven-os');
let START_FILE = null;

const possibleEntries = ['index.ts', 'index.js', 'cli.ts', 'cli.js', 'main.ts'];
for (const entry of possibleEntries) {
    const testPath = path.join(APP_CONTEXT_DIR, entry);
    if (fs.existsSync(testPath)) {
        START_FILE = testPath;
        break;
    }
}

const visitedFiles = new Set();
const missingFiles = [];
const IMPORT_REGEX = /(?:require\(['"](.+?)['"]\)|from\s+['"](.+?)['"]|import\(['"](.+?)['"]\))/g;

function resolveFilePath(baseDir, importPath) {
    if (!importPath || (!importPath.startsWith('.') && !importPath.startsWith('/'))) {
        return null; 
    }

    const fullPath = path.resolve(baseDir, importPath);
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];

    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        return fullPath;
    }

    for (const ext of extensions) {
        const withExt = fullPath + ext;
        if (fs.existsSync(withExt)) return withExt;
    }

    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        for (const ext of extensions) {
            const indexPath = path.join(fullPath, `index${ext}`);
            if (fs.existsSync(indexPath)) return indexPath;
        }
    }

    return fullPath; 
}

function auditFile(filePath, importedFrom = 'Root') {
    if (visitedFiles.has(filePath)) return;
    
    if (!fs.existsSync(filePath)) {
        missingFiles.push({ missing: filePath, from: importedFrom });
        console.log(`\x1b[31m[MISSING]\x1b[0m ${path.relative(APP_CONTEXT_DIR, filePath)}\n          (imported from ${path.relative(APP_CONTEXT_DIR, importedFrom)})\n`);
        return;
    }

    visitedFiles.add(filePath);
    const displayPath = path.relative(APP_CONTEXT_DIR, filePath);
    
    if (filePath.endsWith('ai-router.js') || filePath.endsWith('ai-router.ts')) {
        console.log(`\x1b[35m[AI ROUTER INTERFACE]\x1b[0m ${displayPath} -> Initializing Autonomous Stack`);
    } else {
        console.log(`\x1b[32m[AUDITED]\x1b[0m ${displayPath}`);
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const currentDir = path.dirname(filePath);
        let match;

        IMPORT_REGEX.lastIndex = 0;
        while ((match = IMPORT_REGEX.exec(content)) !== null) {
            const importPath = match[1] || match[2] || match[3];
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
console.log("    SEVEN-OS NESTED TS CONTEXT ROUTING AUDITOR       ");
console.log("====================================================\n");

if (!START_FILE) {
    console.error(`\x1b[31mError: Entry file not found inside directory: ${APP_CONTEXT_DIR}\x1b[0m`);
    process.exit(1);
}

console.log(`Targeting root index context at: .\\seven-os\\${path.basename(START_FILE)}\n`);
auditFile(START_FILE);

console.log('\n--- Context Audit Summary ---');
console.log(`Total files scanned: ${visitedFiles.size}`);
console.log(`Total missing files found: ${missingFiles.length}`);

process.exit(missingFiles.length > 0 ? 1 : 0);

