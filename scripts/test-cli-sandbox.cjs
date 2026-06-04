const fs = require('fs');
const path = require('path');
const os = require('os');
const cp = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const proprietaryDir = path.join(repoRoot, 'proprietary-cli');
if (!fs.existsSync(proprietaryDir)) {
  console.error('proprietary-cli directory not found');
  process.exit(2);
}

async function run() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'proprietary-cli-test-'));
  const target = path.join(tmp, 'proprietary-cli');
  console.log('Creating sandbox at', tmp);

  // copy proprietary-cli folder recursively
  const copyRecursiveSync = (src, dest) => {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    if (stats && stats.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      fs.readdirSync(src).forEach(child => copyRecursiveSync(path.join(src, child), path.join(dest, child)));
    } else if (exists) {
      fs.copyFileSync(src, dest);
    }
  };

  copyRecursiveSync(proprietaryDir, target);

  // write a test config.json inside sandbox
  const cfg = { redisUrl: 'redis://127.0.0.1:6379', natsUrl: 'nats://127.0.0.1:4222', apiKey: 'TEST_KEY' };
  fs.writeFileSync(path.join(target, 'config.json'), JSON.stringify(cfg, null, 2));

  // run cli test command
  const bin = path.join(target, 'bin', 'cli.js');
  console.log('Executing', bin, 'test');
  const res = cp.spawnSync(process.execPath, [bin, 'test'], { encoding: 'utf8', timeout: 10000 });
  console.log('Exit code:', res.status);
  console.log('Stdout:', res.stdout);
  console.log('Stderr:', res.stderr);

  // cleanup
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

  if (res.status === 0) {
    console.log('Sandbox CLI test passed');
    process.exit(0);
  } else {
    console.error('Sandbox CLI test failed');
    process.exit(1);
  }
}

run().catch(err => { console.error(err); process.exit(1); });
