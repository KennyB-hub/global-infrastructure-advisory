// audit-router.js
const fs = require('fs');
const path = require('path');

console.log('==================================================');
console.log('   STARTING SEVEN-OS & RUNTIME ROUTING AUDIT      ');
console.log('==================================================\n');

// 1. Audit package configurations to check entry points
function auditPackageJson(dirName) {
  const pkgPath = path.join(process.cwd(), dirName, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = require(pkgPath);
    console.log(`[${dirName}] Main Entry Point: "${pkg.main || 'index.js'}"`);
    console.log(`[${dirName}] Scripts:`, pkg.scripts || {});
  } else {
    console.log(`[WARN] No package.json found in /${dirName}`);
  }
}

// 2. Scan directories for broken routing or autosorter relics
function scanRouteFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`[ERROR] Directory not found: ${dirPath}`);
    return;
  }
  
  const files = fs.readdirSync(dirPath);
  console.log(`\nFiles found in /${path.basename(dirPath)}:`);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.ts'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Look for routing flags or autosorter modifications
      const hasRouter = content.includes('router') || content.includes('route');
      const hasExports = content.includes('module.exports') || content.includes('exports.');
      
      console.log(`  📄 ${file} -> (Has Routing Logic: ${hasRouter}, CJS Exports: ${hasExports})`);
    }
  });
}

// Execute Audit
auditPackageJson('seven-os');
scanRouteFiles(path.join(process.cwd(), 'seven-os'));

console.log('\n--------------------------------------------------');

auditPackageJson('runtime');
scanRouteFiles(path.join(process.cwd(), 'runtime'));

console.log('\n==================================================');
console.log('Audit complete. Please copy/paste the outputs above.');
