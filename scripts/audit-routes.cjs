#!/usr/bin/env node
// scripts/audit-routes.cjs
// Usage:
//   node scripts/audit-routes.cjs
//   node scripts/audit-routes.cjs --out ./logs/traces/cli/audit.jsonl
//   node scripts/audit-routes.cjs --apply-fix   (will copy global-manifest.json -> manifest.json if missing)

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const argv = process.argv.slice(2);
const outArgIndex = argv.indexOf('--out');
const applyFix = argv.includes('--apply-fix');

const outPath = outArgIndex !== -1 && argv[outArgIndex + 1]
  ? argv[outArgIndex + 1]
  : path.join(process.cwd(), 'logs', 'traces', 'cli', `audit-routes-${new Date().toISOString().replace(/[:]/g,'-')}.jsonl`);

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function findCliEntrypoint() {
  const candidates = [
    path.join(process.cwd(), 'proprietary-cli', 'bin', 'cli.js'),
    path.join(process.cwd(), 'proprietary-cli', 'index.js'),
    path.join(process.cwd(), 'proprietary-cli', 'index.cjs'),
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return null;
}

function copyManifestIfMissing() {
  const base = path.join(process.cwd(), 'proprietary-cli');
  const globalManifest = path.join(base, 'global-manifest.json');
  const manifest = path.join(base, 'manifest.json');
  if (!fs.existsSync(manifest) && fs.existsSync(globalManifest)) {
    fs.copyFileSync(globalManifest, manifest);
    return { applied: true, from: globalManifest, to: manifest };
  }
  return { applied: false };
}

function runCliAudit(cliPath, tracePath) {
  ensureDir(tracePath);
  // prefer running bin/cli.js with --trace if supported
  const args = ['audit-routes', '--trace', tracePath];
  // If cliPath is index.js and imports .ts, try running with node directly first
  const nodeArgs = [cliPath, ...args];
  const result = spawnSync(process.execPath, nodeArgs, { encoding: 'utf8' });
  return result;
}

function parseTraceFile(tracePath) {
  if (!fs.existsSync(tracePath)) return { exists: false };
  const lines = fs.readFileSync(tracePath, 'utf8').split(/\r?\n/).filter(Boolean);
  const errors = [];
  for (const l of lines) {
    try {
      const obj = JSON.parse(l);
      if (obj.level === 'error' || obj.type === 'exception' || (obj.message && /error|exception/i.test(obj.message))) {
        errors.push(obj);
      }
    } catch (e) {
      // ignore parse errors for non-json lines
    }
  }
  return { exists: true, linesCount: lines.length, errors };
}

function scanOutputForProblems(stdout, stderr) {
  const text = [stdout || '', stderr || ''].join('\n');
  const problems = { missingManifest: false, missingGlobalManifest: false, moduleNotFound: [], enoent: [], jsImportTs: [] };

  if (/manifest\.json/i.test(text) && /ENOENT|no such file/i.test(text)) problems.missingManifest = true;
  if (/global-manifest\.json/i.test(text) && /ENOENT|no such file/i.test(text)) problems.missingGlobalManifest = true;

  // Module not found patterns
  const modNotFoundRegex = /Cannot find module ['"]([^'"]+)['"]/g;
  let m;
  while ((m = modNotFoundRegex.exec(text))) problems.moduleNotFound.push(m[1]);

  // ENOENT file paths
  const enoentRegex = /ENOENT:.*open '([^']+)'/g;
  while ((m = enoentRegex.exec(text))) problems.enoent.push(m[1]);

  // JS files importing .ts without loader
  const importTsRegex = /import .*\.ts/g;
  if (importTsRegex.test(text)) {
    // collect lines
    const lines = text.split(/\r?\n/);
    for (const ln of lines) if (/import .*\.ts/.test(ln)) problems.jsImportTs.push(ln.trim());
  }

  return problems;
}

async function main() {
  console.log('Audit runner starting');
  const cliPath = findCliEntrypoint();
  if (!cliPath) {
    console.error('No CLI entrypoint found under proprietary-cli/bin or proprietary-cli/index.js');
    process.exitCode = 2;
    return;
  }
  console.log('Using CLI entrypoint:', cliPath);
  // Optional safe fix: copy global-manifest.json -> manifest.json if missing
  if (applyFix) {
    const fixResult = copyManifestIfMissing();
    if (fixResult.applied) {
      console.log(`Applied manifest fix: copied ${fixResult.from} -> ${fixResult.to}`);
    } else {
      console.log('No manifest fix applied (manifest already present or global-manifest.json missing)');
    }
  }

  console.log('Running audit and writing trace to', outPath);
  const res = runCliAudit(cliPath, outPath);

  if (res.error) {
    console.error('Failed to spawn CLI process:', res.error.message);
    process.exitCode = 3;
    return;
  }

  // Print CLI stdout/stderr summary
  if (res.stdout) console.log('CLI stdout snippet:\n', res.stdout.split(/\r?\n/).slice(0, 40).join('\n'));
  if (res.stderr) console.error('CLI stderr snippet:\n', res.stderr.split(/\r?\n/).slice(0, 40).join('\n'));

  // Scan output for common problems
  const problems = scanOutputForProblems(res.stdout, res.stderr);
  if (problems.missingManifest) console.warn('Detected missing manifest.json referenced by CLI output');
  if (problems.missingGlobalManifest) console.warn('Detected missing global-manifest.json referenced by CLI output');
  if (problems.moduleNotFound.length) {
    console.warn('Module not found entries detected:');
    for (const mod of problems.moduleNotFound) console.warn('  -', mod);
  }
  if (problems.enoent.length) {
    console.warn('ENOENT file paths detected:');
    for (const p of problems.enoent) console.warn('  -', p);
  }
  if (problems.jsImportTs.length) {
    console.warn('JS files importing .ts detected in CLI output (may need ts-loader or extension fixes):');
    for (const l of problems.jsImportTs.slice(0, 20)) console.warn('  ', l);
  }

  // Parse trace file if produced
  const trace = parseTraceFile(outPath);
  if (!trace.exists) {
    console.warn('No trace file produced at', outPath);
  } else {
    console.log(`Trace file produced with ${trace.linesCount} lines`);
    if (trace.errors && trace.errors.length) {
      console.log('First error entries from trace:');
      trace.errors.slice(0, 10).forEach((e, i) => {
        console.log(`--- Error ${i + 1} ---`);
        console.log(JSON.stringify({
          time: e.time || e.timestamp || null,
          level: e.level || e.type || 'error',
          module: e.module || e.file || null,
          file: e.file || null,
          line: e.line || null,
          message: e.message || e.error || e.stack || e
        }, null, 2));
      });
    } else {
      console.log('No error-level entries found in trace');
    }
  }

  // Produce a small remediation checklist file
  const checklist = [];
  if (problems.missingManifest || problems.missingGlobalManifest) checklist.push('Restore manifest.json or copy global-manifest.json -> manifest.json');
  if (problems.moduleNotFound.length) checklist.push('Resolve missing modules listed above; check file paths and extensions (.ts vs .js)');
  if (problems.jsImportTs.length) checklist.push('Add ts-loader import to JS entrypoints that import .ts or convert runtime files to .js');
  if (trace.exists && trace.errors && trace.errors.length) checklist.push('Open trace file and fix the first error entry reported');

  const checklistPath = path.join(process.cwd(), 'logs', 'traces', 'cli', 'audit-remediation-checklist.txt');
  ensureDir(checklistPath);
  fs.writeFileSync(checklistPath, checklist.length ? checklist.join('\n') : 'No immediate remediation items detected\n', 'utf8');
  console.log('Remediation checklist written to', checklistPath);

  console.log('Audit runner finished');
}

main().catch(err => {
  console.error('Unexpected error in audit runner:', err && err.stack ? err.stack : err);
  process.exitCode = 99;
});
