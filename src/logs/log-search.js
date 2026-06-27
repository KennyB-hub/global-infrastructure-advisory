import { readLog } from '../backend/functions/api/logs/log-reader.js';

export function searchLogs(type, query) {
  const logs = readLog(type);

  return logs.filter(entry =>
    JSON.stringify(entry).toLowerCase().includes(query.toLowerCase())
  );
}
