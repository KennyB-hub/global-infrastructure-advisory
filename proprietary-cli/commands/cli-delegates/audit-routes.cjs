// seven-os/cli-delegator/audit-routes.js
import { spawn } from 'node:child_process';
import path from 'node:path';
const script = path.resolve(process.cwd(), 'proprietary-cli', 'commands', 'dev', 'test.js');
const args = ['routing', ...process.argv.slice(2)];
const p = spawn(process.execPath, [script, ...args], { stdio: 'inherit' });
p.on('exit', code => process.exit(code));
