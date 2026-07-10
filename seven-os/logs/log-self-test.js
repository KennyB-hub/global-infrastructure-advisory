import { writeLog } from '../ai/logs/log-writer.js';
import { readLog } from '../backend/functions/api/logs/log-reader.js';
import { logHealthCheck } from './log-health-check.js';

export async function logSelfTest() {
  const testEntry = {
    sessionId: "self-test",
    timestamp: new Date().toISOString(),
    request: { test: true },
    output: { success: true }
  };

  await writeLog('session', testEntry);

  const readBack = readLog('session', { sessionId: "self-test" });
  const health = logHealthCheck();

  return {
    writeSuccess: readBack.length > 0,
    healthStatus: health.status,
    details: health
  };
}
