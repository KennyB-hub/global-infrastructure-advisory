#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const START_FILE = path.resolve(__dirname, 'index.js');
const visitedFiles = new Set();
const missingFiles = [];

// Regular expression to catch require(), import, and dynamic imports
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
        console.log(`\x1b[31m[MISSING]\x1b[0m ${filePath} (imported from ${importedFrom})`);
        return;
    }

    visitedFiles.add(filePath);
    
    if (filePath.endsWith('ai-router.js')) {
        console.log(`\x1b[35m[AI ROUTER INTERFACE]\x1b[0m ${filePath} -> Transitioning to TS Runtime Stack`);
    } else {
        console.log(`\x1b[32m[AUDITED]\x1b[0m ${filePath}`);
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const currentDir = path.dirname(filePath);
        let match;

        // Reset regex index for this file scan
        IMPORT_REGEX.lastIndex = 0;

        while ((match = IMPORT_REGEX.exec(content)) !== null) {
            // Safely find whichever capture group (1, 2, or 3) matched the path
            const importPath = match[1] || match[2] || match[3];
            
            if (importPath) {
                const resolvedPath = resolveFilePath(currentDir, importPath);
                if (resolvedPath) {
                    auditFile(resolvedPath, filePath);
                }
            }
        }
    } catch (err) {
        console.log(`\x1b[33m[WARN]\x1b[0m Failed to parse ${filePath}: ${err.message}`);
    }
}

console.log(`Starting seven-os CLI routing audit from: ${START_FILE}\n`);
if (!fs.existsSync(START_FILE)) {
    console.error(`\x1b[31mError: Root file index.js not found at ${START_FILE}\x1b[0m`);
    process.exit(1);
}

auditFile(START_FILE);

console.log('\n--- Audit Summary ---');
console.log(`Total files scanned: ${visitedFiles.size}`);
console.log(`Total missing files found: ${missingFiles.length}`);

if (missingFiles.length > 0) {
    process.exit(1);
} else {
    console.log('\x1b[32mAll runtime stack routing paths resolved successfully!\x1b[0m');
    process.exit(0);
}

