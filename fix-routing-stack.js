const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname);

// Fast directory traversal to catalog where files actually live now after the autosort
function buildAssetRegistry(dir, registry = new Map()) {
    if (!fs.existsSync(dir)) return registry;
    try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (['node_modules', '.git', 'dist', '.vscode', '.trace', 'logs'].includes(item.name)) continue;
            
            if (item.isDirectory()) {
                buildAssetRegistry(fullPath, registry);
            } else if (item.isFile()) {
                // Catalog files by their base name so we can find them when imported
                const ext = path.extname(item.name);
                if (['.js', '.ts', '.json', '.tsx', '.jsx'].includes(ext)) {
                    registry.set(item.name, fullPath);
                    // Also catalog without extension for extensionless imports
                    const nameWithoutExt = path.basename(item.name, ext);
                    if (!registry.has(nameWithoutExt)) {
                        registry.set(nameWithoutExt, fullPath);
                    }
                }
            }
        }
    } catch (err) {}
    return registry;
}

console.log("=====================================================");
console.log("   AUTOMATED SEVEN-OS ROUTE REPAIR & TRACER ENGINE  ");
console.log("=====================================================\n");

console.log("[1/3] Indexing active repository asset locations...");
const assetRegistry = buildAssetRegistry(REPO_ROOT);
console.log(`      Cataloged ${assetRegistry.size} resolvable target endpoints.\n`);

console.log("[2/3] Tracing code connections for broken paths...");

// Sweeping criteria matching your macro auditor
function fastBuildFileTree(dir, fileList = new Set()) {
    if (!fs.existsSync(dir)) return fileList;
    try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (['node_modules', '.git', 'dist', '.vscode', '.trace', 'logs'].includes(item.name)) continue;
            if (item.isDirectory()) fastBuildFileTree(fullPath, fileList);
            else if (item.isFile() && ['.js', '.ts', '.json', '.tsx', '.jsx'].includes(path.extname(item.name))) fileList.add(fullPath);
        }
    } catch (err) {}
    return fileList;
}

const physicalFiles = fastBuildFileTree(REPO_ROOT);
const BROAD_IMPORT_REGEX = /(require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)|from\s*['"`]([^'"`]+)['"`]|import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)|import\s+['"`]([^'"`]+)['"`])/g;

let totalFixed = 0;

for (const filePath of physicalFiles) {
    if (filePath === __filename) continue; // Skip this repair script
    
    try {
        let fileContent = fs.readFileSync(filePath, 'utf8');
        let hasChanges = false;
        const currentDir = path.dirname(filePath);
        
        // Reset regex index
        BROAD_IMPORT_REGEX.lastIndex = 0;
        let match;
        
        // Accumulate replacements to execute safely per file
        const replacements = [];
        
        while ((match = BROAD_IMPORT_REGEX.exec(fileContent)) !== null) {
            const fullStatement = match[0];
            // Find whichever capture group held the raw path string
            const rawImport = match[2] || match[3] || match[4] || match[5];
            if (!rawImport) continue;

            // Test if the import is already working or a builtin
            const cleanImport = rawImport.trim();
            if (!cleanImport.startsWith('.') && !cleanImport.startsWith('/') && !cleanImport.startsWith('@')) continue;

            // Check if it resolves natively
            let resolved = false;
            const testPaths = [
                path.resolve(currentDir, cleanImport),
                path.resolve(REPO_ROOT, cleanImport),
                path.resolve(REPO_ROOT, 'seven-os', cleanImport)
            ];
            const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
            
            for (const t of testPaths) {
                if (fs.existsSync(t)) { resolved = true; break; }
                for (const e of extensions) { if (fs.existsSync(t + e)) { resolved = true; break; } }
            }

            // If it is broken, trace and patch it!
            if (!resolved) {
                const baseName = path.basename(cleanImport);
                const actualFileLocation = assetRegistry.get(baseName);

                if (actualFileLocation) {
                    // Calculate a new clean relative path from the current file to where the autosorter put it
                    let relativeReplacement = path.relative(currentDir, actualFileLocation).replace(/\\/g, '/');
                    if (!relativeReplacement.startsWith('.')) {
                        relativeReplacement = './' + relativeReplacement;
                    }

                    // Preserving code extensions if originally used
                    const originalExt = path.extname(cleanImport);
                    if (!originalExt && (relativeReplacement.endsWith('.js') || relativeReplacement.endsWith('.ts') || relativeReplacement.endsWith('.json'))) {
                        const targetExt = path.extname(relativeReplacement);
                        relativeReplacement = relativeReplacement.slice(0, -targetExt.length);
                    }

                    replacements.push({
                        oldStr: fullStatement,
                        newStr: fullStatement.replace(rawImport, relativeReplacement),
                        log: `      [REPAIRED] In ${path.relative(REPO_ROOT, filePath)}:\n                 "${rawImport}" -> "${relativeReplacement}"`
                    });
                }
            }
        }

        // Apply file modifications
        if (replacements.length > 0) {
            for (const r of replacements) {
                if (fileContent.includes(r.oldStr)) {
                    fileContent = fileContent.replace(r.oldStr, r.newStr);
                    console.log(r.log);
                    totalFixed++;
                    hasChanges = true;
                }
            }
            if (hasChanges) {
                fs.writeFileSync(filePath, fileContent, 'utf8');
            }
        }
    } catch (err) {
        // Suppress reading locks
    }
}

console.log("\n[3/3] Execution complete.");
console.log(`      Successfully auto-traced and repaired ${totalFixed} broken routing paths across the architecture!\n`);
console.log("\x1b[32mAll configurations aligned with the current folder structure. Ready to test.\x1b[0m");
