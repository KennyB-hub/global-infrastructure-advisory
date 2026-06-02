import fs from 'fs';
import path from 'path';

export function rotateLog(type, maxEntries = 5000) {
  const logPaths = {
    session: path.resolve('src/ai/logs/session-log.json'),
    audit: path.resolve('src/ai/logs/audit-log.json'),
    telemetry: path.resolve('src/ai/logs/telemetry-log.json'),
    memory: path.resolve('src/ai/logs/memory-log.json')
  };

  const file = logPaths[type];
  if (!file) throw new Error(`Unknown log type: ${type}`);

  if (!fs.existsSync(file)) return;

  const entries = JSON.parse(fs.readFileSync(file, 'utf8') || '[]');

  if (entries.length <= maxEntries) return;

  const archivePath = file.replace('.json', `-${Date.now()}-archive.json`);
  fs.writeFileSync(archivePath, JSON.stringify(entries, null, 2));

  fs.writeFileSync(file, JSON.stringify([], null, 2));
}
