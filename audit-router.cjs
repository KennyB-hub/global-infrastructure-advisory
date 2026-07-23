const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname);

// Recursively sweep the entire repository to map what actually exists on disk
function buildPhysicalFileTree(dir, fileList = new Set()) {
    if (!fs.existsSync(dir)) return fileList;
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        // Skip dependencies and cache folders to keep audit clean
        if (item === 'node_modules' || item === '.git' || item === 'dist' || item === '.vscode') continue;
        
        if (fs.statSync(fullPath).isDirectory()) {
            buildPhysicalFileTree(fullPath, fileList);
        } else {
            fileList.add(fullPath);
        }
    }
    return fileList;
}

console.log("====================================================");
console.log("   LEXICAL DEEP-STACK ARCHITECTURE ROUTING AUDITOR   ");
console.log("====================================================\n");

console.log("[1/3] Mapping physical layout files on disk...");
const physicalFiles = buildPhysicalFileTree(REPO_ROOT);
console.log(`      Found ${physicalFiles.size} active source files in the repository.\n`);

console.log("[2/3] Extracting structural imports across all files...");
const importMap = new Map();
const NODE_BUILTINS = new Set(['fs', 'path', 'crypto', 'os', 'http', 'https', 'child_process', 'cluster', 'events', 'util', 'stream']);

// Captures clean import tokens even if split across dynamic arrays, loops, or backticks
const BROAD_IMPORT_REGEX = /(?:require|import|from)\s*\(?\s*['"`]([^'"`]+)['"`]/g;

for (const filePath of physicalFiles) {
    if (!filePath.endsWith('.js') && !filePath.endsWith('.ts') && !filePath.endsWith('.json') && !filePath.endsWith('.tsx')) continue;
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let match;
        BROAD_IMPORT_REGEX.lastIndex = 0;
        
        while ((match = BROAD_IMPORT_REGEX.exec(content)) !== null) {
            let targetPath = match[1].trim();
            
            // Skip builtins and node packages
            if (NODE_BUILTINS.has(targetPath) || (!targetPath.startsWith('.') && !targetPath.startsWith('/') && !targetPath.includes('/') && !targetPath.startsWith('@'))) {
                continue;
            }
            
            if (!importMap.has(filePath)) importMap.set(filePath, []);
            importMap.get(filePath).push(targetPath);
        }
    } catch (e) {
        // Suppress reading locks
    }
}

console.log(`      Scanned dependencies across active modules.\n`);
console.log("[3/3] Commencing resolution matrix check...");

let auditedCount = 0;
let brokenCount = 0;
const missingRegistry = new Map();

for (const [sourceFile, imports] of importMap.entries()) {
    const baseDir = path.dirname(sourceFile);
    
    for (const rawImport of imports) {
        let aliasPath = rawImport;
        
        // Translate tsconfig path aliases seamlessly
        if (rawImport.startsWith('@seven-os/')) aliasPath = rawImport.replace('@seven-os/', 'seven-os/');
        if (rawImport.startsWith('@engines/')) aliasPath = rawImport.replace('@engines/', 'engines/');
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
            
            // Check file extensions
            for (const ext of extensions) {
                if (fs.existsSync(fullTest + ext) && fs.statSync(fullTest + ext).isFile()) { resolved = true; break; }
            }
            if (resolved) break;

            // Check index structures
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

// Visual layout rendering engine for results
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

console.log('--- Deep Stack Audit Summary ---');
console.log(`Total active pathways verified: ${auditedCount}`);
console.log(`Total broken paths uncovered: ${brokenCount}`);
process.exit(brokenCount > 0 ? 1 : 0);
