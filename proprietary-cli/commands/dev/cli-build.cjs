#!/usr/bin/env node
// proprietary-cli/commands/dev/cli-build.cjs
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const repoRoot = process.cwd();
const candidates = [
  path.join(repoRoot, 'scripts', 'cli-build.cjs'),
  path.join(repoRoot, 'proprietary-cli', 'commands', 'dev', 'cli-build.impl.cjs')
];

// If a canonical build script exists, run it
for (const c of candidates) {
  if (fs.existsSync(c)) {
    console.log('Running canonical CLI build script:', c);
    const r = spawnSync(process.execPath, [c, ...process.argv.slice(2)], { stdio: 'inherit' });
    process.exit(r.status || 0);
  }
}

// Fallback: if seven-os has tsconfig, run tsc
const tsconfig = path.join(repoRoot, 'seven-os', 'tsconfig.json');
if (fs.existsSync(tsconfig)) {
  console.log('No canonical CLI build found. Running tsc using seven-os/tsconfig.json');
  const r = spawnSync('npx', ['tsc', '--project', tsconfig], { stdio: 'inherit', shell: true });
  process.exit(r.status || 0);
}

// Final fallback: print instructions
console.error('No CLI build script found and no tsconfig present.');
console.error('Create scripts/cli-build.cjs or proprietary-cli/commands/dev/cli-build.impl.cjs to define the CLI build steps.');
process.exit(1);
