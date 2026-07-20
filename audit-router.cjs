const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname);

// Fast enterprise directory traversal module
function fastBuildFileTree(dir, fileList = new Set()) {
    if (!fs.existsSync(dir)) return fileList;
    try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            
            // Strictly ignore dependencies, git history, distribution caches, or temporary runtime dumps
            if (
                item.name === 'node_modules' || 
                item.name === '.git' || 
                item.name === 'dist' || 
                item.name === '.vscode' || 
                item.name === '.trace' ||
                item.name === 'logs'
            ) continue;
            
            if (item.isDirectory()) {
                fastBuildFileTree(fullPath, fileList);
            } else if (item.isFile()) {
                const ext = path.extname(item.name);
                // Only catalog code/config files to avoid wasting memory on binary resources
                if (ext === '.js' || ext === '.ts' || ext === '.json' || ext === '.tsx' || ext === '.jsx') {
                    fileList.add(fullPath);
                }
            }
        }
    } catch (err) {
        // Bypass reading protection blocks gracefully
    }
    return fileList;
}

console.log("=====================================================");
console.log("   ENTERPRISE LEXICAL ARCHITECTURE ROUTING AUDITOR   ");
console.log("=====================================================\n");

console.log("[1/3] Sweeping repository directory tree...");
const physicalFiles = fastBuildFileTree(REPO_ROOT);
console.log(`      Successfully cataloged ${physicalFiles.size} target source assets inside workspace.\n`);

console.log("[2/3] Extracting structural imports via fast memory mapping...");
const importMap = new Map();
const NODE_BUILTINS = new Set(['fs', 'path', 'crypto', 'os', 'http', 'https', 'child_process', 'cluster', 'events', 'util', 'stream']);

// Scale-optimized tokenizer capturing clean require, import, and module target pathways
const BROAD_IMPORT_REGEX = /(?:require|import|from)\s*\(?\s*['"`]([^'"`]+)['"`]/g;

for (const filePath of physicalFiles) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let match;
        BROAD_IMPORT_REGEX.lastIndex = 0;
        
        while ((match = BROAD_IMPORT_REGEX.exec(content)) !== null) {
            const targetPath = match[1] ? match[1].trim() : null;
            if (!targetPath) continue;
            
            // Filter out node core libraries or external npm modules instantly
            if (NODE_BUILTINS.has(targetPath) || (!targetPath.startsWith('.') && !targetPath.startsWith('/') && !targetPath.includes('/') && !targetPath.startsWith('@'))) {
                continue;
            }
            
            if (!importMap.has(filePath)) importMap.set(filePath, []);
            importMap.get(filePath).push(targetPath);
        }
    } catch (e) {
        // Suppress protected lock warnings
    }
}

console.log(`      Analyzed dependencies across all active application modules.\n`);
console.log("[3/3] Cross-referencing architecture path resolution matrix...");

let auditedCount = 0;
let brokenCount = 0;
const missingRegistry = new Map();

for (const [sourceFile, imports] of importMap.entries()) {
    const baseDir = path.dirname(sourceFile);
    
    for (const rawImport of imports) {
        let aliasPath = rawImport;
        
        // Match tsconfig path configurations natively
        if (rawImport.startsWith('@seven-os/')) aliasPath = rawImport.replace('@seven-os/', 'seven-os/');
        if (rawImport.startsWith('@ai-engines/')) aliasPath = rawImport.replace('@ai-engines/', 'ai-engines/');
        if (rawImport.startsWith('@autonomous/')) aliasPath = rawImport.replace('@autonomous/', 'autonomous/');
        if (rawImport.startsWith('@runtime/')) aliasPath = rawImport.replace('@runtime/', 'seven-runtime/');
        if (rawImport.startsWith('@proprietary-cli/')) aliasPath = rawImport.replace('@proprietary-cli/', 'proprietary-cli/');
        if (rawImport.startsWith('@scripts/')) aliasPath = rawImport.replace('@scripts/', 'scripts/');

        const testPaths = [];
        if (rawImport.startsWith('.') || rawImport.startsWith('/')) {
            testPaths.push(path.resolve(baseDir, aliasPath));
        } else {
            testPaths.push(path.resolve(REPO_ROOT, aliasPath));
            testPaths.push(path.resolve(REPO_ROOT, 'seven-os', aliasPath));
        }

        if (rawImport.startsWith('..')) {
            testPaths.push(path.resolve(REPO_ROOT, rawImport.replace(/^\.\.\//, '')));
        }

        let resolved = false;
        const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];

        for (const fullTest of testPaths) {
            if (fs.existsSync(fullTest) && fs.statSync(fullTest).isFile()) { resolved = true; break; }
            
            for (const ext of extensions) {
                if (fs.existsSync(fullTest + ext) && fs.statSync(fullTest + ext).isFile()) { resolved = true; break; }
            }
            if (resolved) break;

            if (fs.existsSync(fullTest) && fs.statSync(fullTest).isDirectory()) {
                for (const ext of extensions) {
                    const indexCheck = path.join(fullTest, `index${ext}`);
                    if (fs.existsSync(indexCheck) && fs.statSync(indexCheck).isFile()) { resolved = true; break; }
                }
            }
            if (resolved) break;
        }

        const sourceDisplay = path.relative(REPO_ROOT, sourceFile);
        if (resolved) {
            auditedCount++;
        } else {
            brokenCount++;
            if (!missingRegistry.has(sourceDisplay)) missingRegistry.set(sourceDisplay, []);
            missingRegistry.get(sourceDisplay).push(rawImport);
        }
    }
}

// Render structural mapping anomalies directly to the console stream
for (const [file, items] of missingRegistry.entries()) {
    const lower = file.toLowerCase();
    let prefix = "\x1b[32m[AUDITED]\x1b[0m";
    if (lower.includes('proprietary-cli')) prefix = "\x1b[33m[PROPRIETARY CLI]\x1b[0m";
    else if (lower.includes('scripts')) prefix = "\x1b[34m[AUTOMATION SCRIPT]\x1b[0m";
    else if (lower.includes('ai-router') || lower.includes('autonomous')) prefix = "\x1b[35m[AI / AUTONOMOUS STACK]\x1b[0m";
    else if (lower.includes('seven-runtime') || lower.includes('stack')) prefix = "\x1b[36m[RUNTIME ENGINE]\x1b[0m";

    console.log(`${prefix} ${file}`);
    for (const missing of items) {
        console.log(`   \x1b[31m[MISSING CONNECTION]\x1b[0m --> ${missing}`);
    }
    console.log('');
}

console.log('--- Enterprise Stack Audit Summary ---');
console.log(`Total active pathways verified: ${auditedCount}`);
console.log(`Total broken paths uncovered: ${brokenCount}`);
process.exit(brokenCount > 0 ? 1 : 0);
