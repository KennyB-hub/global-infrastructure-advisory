import fs from 'fs';
import path from 'path';

export async function writeLog(type, entry) {
  const logPaths = {
    session: path.resolve('src/ai/logs/session-log.json'),
    audit: path.resolve('src/ai/logs/audit-log.json'),
    telemetry: path.resolve('src/ai/logs/telemetry-log.json'),
    memory: path.resolve('src/ai/logs/memory-log.json')
  };

  const file = logPaths[type];
  if (!file) throw new Error(`Unknown log type: ${type}`);

  const existing = fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, 'utf8') || '[]')
    : [];

  existing.push({
    ...entry,
    timestamp: new Date().toISOString()
  });

  fs.writeFileSync(file, JSON.stringify(existing, null, 2));
  return true;
}
