import { getLogDashboard } from './log-dashboard.js';
import { analyzeLogs } from './log-analyzer.js';

export async function buildLogUIDashboard() {
  const dashboard = await getLogDashboard();
  const analysis = analyzeLogs();

  return {
    header: {
      title: "Sovereign Log Dashboard",
      timestamp: new Date().toISOString()
    },
    metrics: {
      totalSessions: dashboard.summary.totalSessions,
      totalAudits: dashboard.summary.totalAudits,
      totalTelemetry: dashboard.summary.totalTelemetry,
      totalMemoryEvents: dashboard.summary.totalMemoryEvents
    },
    analysis: {
      routingErrors: analysis.routingErrors.length,
      engineFailures: analysis.engineFailures.length,
      slowEngines: analysis.slowEngines.length,
      fallbackEvents: analysis.fallbackEvents.length,
      trustZoneMismatches: analysis.trustZoneMismatches.length
    },
    raw: {
      dashboard,
      analysis
    }
  };
}
