export class IncidentRouter {
  route(event: CyberEvent, anomaly: string | null) {
    if (!anomaly) return { action: 'log' };

    if (anomaly === 'cross_sector_privilege_escalation') {
      return { action: 'block', reason: anomaly };
    }

    if (anomaly === 'suspicious_config_change') {
      return { action: 'isolate', reason: anomaly };
    }

    return { action: 'alert', reason: anomaly };
  }
}
