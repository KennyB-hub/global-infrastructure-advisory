const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname);

function fastBuildFileTree(dir, fileList = new Set()) {
    if (!fs.existsSync(dir)) return fileList;
    try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (['node_modules', '.git', 'dist', '.vscode', '.trace', 'logs'].includes(item.name)) continue;
            
            if (item.isDirectory()) {
                fastBuildFileTree(fullPath, fileList);
            } else if (item.isFile()) {
                const ext = path.extname(item.name);
                if (['.js', '.ts', '.json', '.tsx', '.jsx'].includes(ext)) {
                    fileList.add(fullPath);
                }
            }
        }
    } catch (err) {}
    return fileList;
}

console.log("=====================================================");
console.log("   MACRO-ALIGNED ENTERPRISE ROUTING AUDITOR v3       ");
console.log("=====================================================\n");

const physicalFiles = fastBuildFileTree(REPO_ROOT);
const importMap = new Map();
const NODE_BUILTINS = new Set(['fs', 'path', 'crypto', 'os', 'http', 'https', 'child_process', 'cluster', 'events', 'util', 'stream']);
const BROAD_IMPORT_REGEX = /(?:require|import|from)\s*\(?\s*['"`]([^'"`]+)['"`]/g;

for (const filePath of physicalFiles) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let match;
        BROAD_IMPORT_REGEX.lastIndex = 0;
        while ((match = BROAD_IMPORT_REGEX.exec(content)) !== null) {
            const targetPath = match ? match.trim() : null;
            if (!targetPath) continue;
            if (NODE_BUILTINS.has(targetPath) || (!targetPath.startsWith('.') && !targetPath.startsWith('/') && !targetPath.includes('/') && !targetPath.startsWith('@'))) continue;
            if (!importMap.has(filePath)) importMap.set(filePath, []);
            importMap.get(filePath).push(targetPath);
        }
    } catch (e) {}
}

let auditedCount = 0;
let brokenCount = 0;
const missingRegistry = new Map();

for (const [sourceFile, imports] of importMap.entries()) {
    const baseDir = path.dirname(sourceFile);
    for (const rawImport of imports) {
        let aliasPath = rawImport;
        if (rawImport.startsWith('@seven-os/')) aliasPath = rawImport.replace('@seven-os/', 'seven-os/');
        if (rawImport.startsWith('@engines/')) aliasPath = rawImport.replace('@ai-engines/', 'engines/');
        if (rawImport.startsWith('@autonomous/')) aliasPath = rawImport.replace('@autonomous/', 'autonomous/');
        if (rawImport.startsWith('@runtime/')) aliasPath = rawImport.replace('@runtime/', 'seven-runtime/');
        if (rawImport.startsWith('@proprietary-cli/')) aliasPath = rawImport.replace('@proprietary-cli/', 'proprietary-cli/');
        if (rawImport.startsWith('@scripts/')) aliasPath = rawImport.replace('@scripts/', 'scripts/');

        const testPaths = [];
        if (rawImport.startsWith('.') || rawImport.startsWith('/')) {
            testPaths.push(path.resolve(baseDir, aliasPath));
            // Deep autosorter fallback if a relative path got nested too deep
            testPaths.push(path.resolve(baseDir, '..', aliasPath));
        } else {
            testPaths.push(path.resolve(REPO_ROOT, aliasPath));
            testPaths.push(path.resolve(REPO_ROOT, 'seven-os', aliasPath));
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

for (const [file, items] of missingRegistry.entries()) {
    const lower = file.toLowerCase();
    let prefix = "\x1b[32m[AUDITED]\x1b[0m";
    if (lower.includes('proprietary-cli')) prefix = "\x1b[33m[PROPRIETARY CLI]\x1b[0m";
    else if (lower.includes('scripts')) prefix = "\x1b[34m[AUTOMATION SCRIPT]\x1b[0m";
    else if (lower.includes('ai-router') || lower.includes('autonomous')) prefix = "\x1b[35m[AI / AUTONOMOUS STACK]\x1b[0m";
    else if (lower.includes('seven-runtime') || lower.includes('stack')) prefix = "\x1b[36m[RUNTIME ENGINE]\x1b[0m";
    console.log(`${prefix} ${file}`);
    for (const missing of items) console.log(`   \x1b[31m[MISSING CONNECTION]\x1b[0m --> ${missing}`);
    console.log('');
}

console.log('--- Enterprise Macro Stack Audit Summary ---');
console.log(`Total active pathways verified: ${auditedCount}`);
console.log(`Total broken paths uncovered: ${brokenCount}`);
process.exit(brokenCount > 0 ? 1 : 0);
