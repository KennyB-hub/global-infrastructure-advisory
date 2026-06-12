const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const outDir = path.join(repoRoot, 'reports');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const licenseSignatures = [
  { id: 'MIT', re: /MIT License/i },
  { id: 'Apache-2.0', re: /Apache License/i },
  { id: 'GPL', re: /GNU GENERAL PUBLIC LICENSE/i },
  { id: 'BSD', re: /BSD License/i },
  { id: 'Proprietary', re: /All rights reserved|Proprietary/i }
];

const findings = {};
licenseSignatures.forEach(l => findings[l.id] = []);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist') continue;
      walk(full);
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      if (!['.js','.ts','.json','.md','.txt','.css','.html'].includes(ext)) continue;
      try {
        const content = fs.readFileSync(full, 'utf8');
        licenseSignatures.forEach(sig => {
          if (sig.re.test(content)) {
            findings[sig.id].push(path.relative(repoRoot, full).replace(/\\/g,'/'));
          }
        });
      } catch (e) {}
    }
  }
}

console.log('Scanning for license signatures...');
walk(repoRoot);
const outPath = path.join(outDir, 'license-scan.json');
fs.writeFileSync(outPath, JSON.stringify({ scannedAt: new Date().toISOString(), findings }, null, 2));
console.log('License scan complete. Report:', outPath);
process.exit(0);
