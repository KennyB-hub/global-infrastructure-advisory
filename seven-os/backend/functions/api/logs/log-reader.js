import fs from 'fs';
import path from 'path';

export function readLog(type, filters = {}) {
  const logPaths = {
    session: path.resolve('seven-os/engines/ai/logs/session-log.json'),
    audit: path.resolve('seven-os/engines/ai/logs/audit-log.json'),
    telemetry: path.resolve('seven-os/engines/ai/logs/telemetry-log.json'),
    memory: path.resolve('seven-os/engines/ai/logs/memory-log.json')
  };

  const file = logPaths[type];
  if (!file) throw new Error(`Unknown log type: ${type}`);

  if (!fs.existsSync(file)) return [];

  const entries = JSON.parse(fs.readFileSync(file, 'utf8') || '[]');

  return entries.filter(entry => {
    return Object.entries(filters).every(([key, value]) => {
      return entry[key] === value;
    });
  });
}
