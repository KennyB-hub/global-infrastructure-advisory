import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { readLog } from './log-reader.js';

export function exportLogs(type = 'all', format = 'json') {
  const logs = {
    session: readLog('session'),
    audit: readLog('audit'),
    telemetry: readLog('telemetry'),
    memory: readLog('memory')
  };

  const exportData =
    type === 'all'
      ? logs
      : { [type]: logs[type] || [] };

  const outputPath = path.resolve(
    `seven-os/engines/ai/logs/export-${Date.now()}.${format === 'ndjson' ? 'ndjson' : 'json'}`
  );

  if (format === 'ndjson') {
    const ndjson = Object.entries(exportData)
      .map(([key, arr]) =>
        arr.map(entry => JSON.stringify({ type: key, ...entry })).join('\n')
      )
      .join('\n');

    fs.writeFileSync(outputPath, ndjson);
  } else {
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
  }

  if (format === 'gz') {
    const gzPath = outputPath + '.gz';
    const data = fs.readFileSync(outputPath);
    fs.writeFileSync(gzPath, zlib.gzipSync(data));
    return gzPath;
  }

  return outputPath;
}
