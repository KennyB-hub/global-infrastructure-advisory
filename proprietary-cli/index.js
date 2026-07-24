#!/usr/bin/env node

// Enable TypeScript support
import './ts-loader.js';

import doctorCommand from '../seven-os/ai/tools/security/command/system/doctor.ts';
import repairRouting from '../seven-os/ai/tools/security/command/system/repair-routing.ts';
import scanMissing from '../seven-os/ai/tools/security/command/system/scan-missing.ts';
import fixValidators from '../seven-os/ai/tools/security/command/system/fix-validators.ts';

const args = process.argv.slice(2);
const command = args[0];

(async () => {
  switch (command) {
    case 'doctor':
      await doctorCommand();
      break;

    case 'repair-routing':
      await repairRouting();
      break;

    case 'scan-missing':
      await scanMissing();
      break;

    case 'fix-validators':
      await fixValidators();
      break;

    default:
      console.log('Unknown command:', command);
      console.log('Available commands: doctor, repair-routing, scan-missing, fix-validators');
  }
})();
