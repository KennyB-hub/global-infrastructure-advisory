import fs from 'fs';
import path from 'path';
import { validateLog } from './log-validator.js';

export function logHealthCheck() {
  const logDir = path.resolve('seven-os/ai/logs');
  const files = [
    'session-log.json',
    'audit-log.json',
    'telemetry-log.json',
    'memory-log.json',
    'log-schema.json',
    'log-metrics.json'
  ];

  const results = files.map(file => {
    const fullPath = path.join(logDir, file);

    const exists = fs.existsSync(fullPath);
    let readable = false;
    let writable = false;

    if (exists) {
      try {
        fs.readFileSync(fullPath, 'utf8');
        readable = true;
      } catch {}

      try {
        fs.accessSync(fullPath, fs.constants.W_OK);
        writable = true;
      } catch {}
    }

    return {
      file,
      exists,
      readable,
      writable
    };
  });

  return {
    timestamp: new Date().toISOString(),
    status: results.every(r => r.exists && r.readable && r.writable)
      ? "healthy"
      : "degraded",
    files: results
  };
}
