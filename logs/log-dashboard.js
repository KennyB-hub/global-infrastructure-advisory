import { readLog } from './log-reader.js';

export async function getLogDashboard() {
  return {
    session: readLog('session'),
    audit: readLog('audit'),
    telemetry: readLog('telemetry'),
    memory: readLog('memory'),
    summary: {
      totalSessions: readLog('session').length,
      totalAudits: readLog('audit').length,
      totalTelemetry: readLog('telemetry').length,
      totalMemoryEvents: readLog('memory').length
    }
  };
}
