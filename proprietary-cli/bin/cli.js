#!/usr/bin/env node
// Proprietary CLI placeholder
// Keep secrets out of this repo; use config.json (ignored) for runtime secrets.

const fs = require('fs');
const path = require('path');

function usage() {
  console.log('Proprietary CLI — placeholder\\n');
  console.log('Usage: proprietary-cli <command> [options]\\n');
  console.log('Commands:\\n  test    — run a quick internal test\\n  help    — show this help');
}

async function main() {
  const cmd = process.argv[2];
  if (!cmd || cmd === 'help') return usage();
  if (cmd === 'test') {
    console.log('Running proprietary CLI internal test...');
    // Example: check for config.json (ignored in git)
    const cfgPath = path.join(__dirname, '..', 'config.json');
    if (fs.existsSync(cfgPath)) console.log('config.json present (ok)');
    else console.log('config.json missing — use config.example.json as template');
    return;
  }
  usage();
}

main().catch(err => { console.error(err); process.exit(1); });