import { analyzeLogs } from '../backend/functions/api/logs/log-analyzer.js';

export function checkForAlerts() {
  const analysis = analyzeLogs();

  return {
    routingErrors: analysis.routingErrors.length > 0,
    engineFailures: analysis.engineFailures.length > 0,
    slowEngines: analysis.slowEngines.length > 0,
    fallbackEvents: analysis.fallbackEvents.length > 0,
    trustZoneMismatches: analysis.trustZoneMismatches.length > 0
  };
}
