export class AnomalyDetector {
  detect(event: CyberEvent): string | null {
    if (event.sector === 'public' && event.trustZone === 'system') {
      return 'cross_sector_privilege_escalation';
    }

    if (event.type === 'config_change' && event.severity === 'high') {
      return 'suspicious_config_change';
    }

    return null;
  }
}
