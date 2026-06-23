import fs from 'fs';
import path from 'path';

export function cleanLogs(options = {}) {
  const { type = 'all', beforeDate = null } = options;

  const logPaths = {
    session: path.resolve('src/ai/logs/session-log.json'),
    audit: path.resolve('src/ai/logs/audit-log.json'),
    telemetry: path.resolve('src/ai/logs/telemetry-log.json'),
    memory: path.resolve('src/ai/logs/memory-log.json')
  };

  const cleanFile = file => {
    if (!fs.existsSync(file)) return;

    const entries = JSON.parse(fs.readFileSync(file, 'utf8') || '[]');

    const filtered = beforeDate
      ? entries.filter(e => new Date(e.timestamp) >= new Date(beforeDate))
      : [];

    fs.writeFileSync(file, JSON.stringify(filtered, null, 2));
  };

  if (type === 'all') {
    Object.values(logPaths).forEach(cleanFile);
  } else {
    cleanFile(logPaths[type]);
  }

  return true;
}
