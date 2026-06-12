const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const outDir = path.join(repoRoot, 'reports');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const ignoreDirs = new Set(['.git', 'node_modules', 'dist', 'logs', 'public']);
const secretPatterns = [
  { name: 'Private Key', re: /-----BEGIN (?:RSA |EC |)PRIVATE KEY-----/i },
  { name: 'AWS Access Key', re: /AKIA[0-9A-Z]{16}/ },
  { name: 'Google API Key', re: /AIza[0-9A-Za-z-_]{35}/ },
  { name: 'Generic API Key', re: /api[_-]?key\s*[=:\"]\s*[A-Za-z0-9\/-_]{16,}/i },
  { name: 'JWT', re: /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_.-]+\.[a-zA-Z0-9_.-]+/ },
  { name: 'Password Assignment', re: /password\s*[=:\"]\s*[^\s\'\"]+/i },
  { name: 'Secret', re: /secret\s*[=:\"]\s*[^\s\'\"]+/i }
];

const results = [];

function isBinary(filename) {
  const textExt = ['.js','.ts','.json','.md','.txt','.html','.css','.yml','.yaml','.env','.cjs','.mjs'];
  return !textExt.includes(path.extname(filename).toLowerCase());
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (ignoreDirs.has(e.name)) continue;
      walk(full);
    } else if (e.isFile()) {
      const rel = path.relative(repoRoot, full);
      if (rel.startsWith('reports') || rel.startsWith('proprietary-cli')) continue; // skip reports and proprietary CLI
      if (isBinary(full)) continue;
      try {
        const content = fs.readFileSync(full, 'utf8');
        secretPatterns.forEach(p => {
          const m = content.match(p.re);
          if (m) {
            results.push({ file: rel.replace(/\\/g,'/'), type: p.name, snippet: (m[0]||'').slice(0,200) });
          }
        });
      } catch (e) {
        // skip unreadable
      }
    }
  }
}

console.log('Scanning for secrets...');
walk(repoRoot);
const outPath = path.join(outDir, 'secret-scan.json');
fs.writeFileSync(outPath, JSON.stringify({ scannedAt: new Date().toISOString(), findings: results }, null, 2));
console.log('Scan complete. Findings:', results.length); 
console.log('Wrote report to', outPath);
process.exit(results.length>0?0:0);
