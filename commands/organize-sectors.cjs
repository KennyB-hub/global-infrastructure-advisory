const writeReport = require("../utilities/write-report.cjs");
const fs = require('fs');
const path = require('path');

// Target paths inside your seven-os structure
const SECTORS_DIR = path.join(process.cwd(), 'seven-os', 'system', 'sectors');
const ENGINES_DIR = path.join(process.cwd(), 'seven-os', 'system', 'engines');
const CONTRACTS_DIR = path.join(process.cwd(), 'seven-os', 'system', 'contracts');

// Loose files identified by your self-audit log that belong in structural folders
const FILES_TO_MOVE = {
  engines: [
    'auto-scaler.js',
    'cross-sector-routing-engine.js',
    'sector-engine.js',
    'sectorAnalysis.js'
  ],
  contracts: [
    'microgrid-engine-contract.json',
    'rural-node-spec.json',
    'sector-contract.json',
    'sectors.json',
    'index.json'
  ]
};

function executeIsolation() {
  console.log('🛡️  Beginning Mission Phoenix Structural Alignment Audit...');

  // Ensure target directories exist safely
  [ENGINES_DIR, CONTRACTS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created target layer directory: ${dir}`);
    }
  });

  // 1. Move JavaScript Logic Engines out of physical sector arrays
  FILES_TO_MOVE.engines.forEach(file => {
    const oldPath = path.join(SECTORS_DIR, file);
    const newPath = path.join(ENGINES_DIR, file);
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      console.log(`✅ ISOLATED ENGINE: Moved ${file} -> /system/engines/`);
    }
  });

  // 2. Move JSON Data Contracts out of physical sector arrays
  FILES_TO_MOVE.contracts.forEach(file => {
    const oldPath = path.join(SECTORS_DIR, file);
    const newPath = path.join(CONTRACTS_DIR, file);
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      console.log(`✅ ISOLATED CONTRACT: Moved ${file} -> /system/contracts/`);
    }
  });

  console.log('🔒 Structure aligned. Loose processing scripts separated from physical grids.');
}

executeIsolation();
