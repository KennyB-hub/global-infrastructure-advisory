#!/usr/bin/env node

import doctorCommand from './command/system/doctor';

const args = process.argv.slice(2);
const command = args[0];

(async () => {
  switch (command) {
    case 'doctor':
      await doctorCommand();
      break;

    default:
      console.log('Unknown command:', command);
      console.log('Available commands: doctor');
  }
})();
