import { readLog } from './log-reader.js';

export function analyzeLogs() {
  const session = readLog('session');
  const telemetry = readLog('telemetry');

  return {
    routingErrors: session.filter(e => e.routing?.worker === null),
    engineFailures: session.filter(e => e.output?.success === false),
    slowEngines: telemetry.filter(e => e.durationMs > 2000),
    fallbackEvents: telemetry.filter(e => e.engineMetrics?.fallbacks?.length > 0),
    trustZoneMismatches: session.filter(
      e => e.user?.trustZone !== e.routing?.sectorEngine
    )
  };
}
