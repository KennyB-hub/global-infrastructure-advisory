const LAYERS = {
  runtime:        ['runtime'],
  os_core:        ['seven-os/ai', 'seven-os/core', 'seven-os/system', 'seven-os/drone', 'seven-os/cattle', 'seven-os/infra'],
  domain:         ['domain'],
  api:            ['api'],
  utilities:      ['utilities'],
  workers:        ['seven-os/workers', 'domain/infrastructure/workers'],
  dashboard:      ['utilities/dashboard'],
  services:       ['services'],
  interop:        ['interop'],
  intelligence:   ['intelligence']
};

const fs = require('fs');
const path = require('path');

function collectEnginesFromDir(rootDir, kind, sectionName) {
  const entries = [];

  function walk(dir) {
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        walk(full);
      } else {
        // Skip obvious non-engines if you want:
        if (item.endsWith('.test.ts') || item.endsWith('.md')) return;

        entries.push({
          id: full.replace(/\\/g, '/'),
          path: full.replace(/\\/g, '/'),
          kind,
          section: sectionName
        });
      }
    }
  }

  walk(rootDir);
  return entries;
}

const manifest = {
  version: '2.0.0',
  generated_at: new Date().toISOString(),
  runtime: [],
  os_core: [],
  domain: [],
  api: [],
  utilities: [],
  workers: [],
  dashboard: [],
  services: [],
  interop: [],
  intelligence: []
};

for (const [section, roots] of Object.entries(LAYERS)) {
  for (const root of roots) {
    const kind = section === 'api' ? 'api-endpoint'
               : section === 'workers' ? 'worker-engine'
               : section === 'dashboard' ? 'dashboard-engine'
               : section === 'runtime' ? 'runtime-engine'
               : 'engine';

    const engines = collectEnginesFromDir(path.join(process.cwd(), root), kind, section);
    manifest[section].push(...engines);
  }
}

const outputPath = path.join(process.cwd(), 'seven-os', 'global-manifest.json');
fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log('✅ global-manifest.json updated for version 2.0.0 with all layers.');
