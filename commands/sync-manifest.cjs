const fs = require('fs');
const path = require('path');

const LAYERS = { 
  runtime: ['runtime'], 
  os_core: ['seven-os/ai', 'seven-os/core', 'seven-os/system', 'seven-os/drone', 'seven-os/cattle', 'seven-os/infra'], 
  domain: ['domain'], 
  api: ['api'], 
  utilities: ['utilities'], 
  workers: ['seven-os/workers', 'domain/infrastructure/workers'], 
  dashboard: ['utilities/dashboard'], 
  services: ['services'], 
  interop: ['interop'], 
  intelligence: ['intelligence'] 
}; 

const outputPath = path.join(process.cwd(), 'seven-os', 'global-manifest.json'); 

// 1. Load your authentic, uncorrupted manifest copy
if (!fs.existsSync(outputPath)) {
  console.error("❌ Active manifest file missing! Please place your routing copy back into /seven-os/global-manifest.json first.");
  process.exit(1);
}

let targetManifest = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
console.log(`📦 Loaded active manifest file (${Object.keys(targetManifest).length} core root properties).`);

function collectFiles(rootDir, kind, sectionName) {
  const entries = [];
  if (!fs.existsSync(rootDir)) return entries;

  function walk(dir) {
    let items = [];
    try { items = fs.readdirSync(dir); } catch (e) { return; }
    for (const item of items) {
      const full = path.join(dir, item);
      try {
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          walk(full);
        } else {
          if (item.endsWith('.test.ts') || item.endsWith('.md')) continue;
          entries.push({
            id: full.replace(/\\/g, '/'),
            path: full.replace(/\\/g, '/'),
            kind,
            section: sectionName
          });
        }
      } catch (err) {}
    }
  }
  walk(rootDir);
  return entries;
}

// 2. Scan and append without deleting your custom routing infrastructure
let addedCount = 0;
for (const [section, roots] of Object.entries(LAYERS)) {
  if (!Array.isArray(targetManifest[section])) {
    targetManifest[section] = [];
  }

  // Map existing IDs so we never overwrite custom metadata fields
  const existingIds = new Set(targetManifest[section].map(item => item.id || item.path));

  for (const root of roots) {
    const kind = section === 'api' ? 'api-endpoint' : 
                 section === 'workers' ? 'worker-engine' : 
                 section === 'dashboard' ? 'dashboard-engine' : 
                 section === 'runtime' ? 'runtime-engine' : 'engine';

    const freshDetections = collectFiles(path.join(process.cwd(), root), kind, section);

    freshDetections.forEach(file => {
      if (!existingIds.has(file.id)) {
        targetManifest[section].push(file);
        existingIds.add(file.id);
        addedCount++;
      }
    });
  }
}

// 3. Secure writeback
targetManifest.generated_at = new Date().toISOString();
fs.writeFileSync(outputPath, JSON.stringify(targetManifest, null, 2), 'utf8');
console.log(`\n✅ Safe Sync Complete! Added ${addedCount} new unmapped files.`);
console.log(`🔒 Your Cloudflare tunnels, Git keys, and active routes remain completely untouched.`);
