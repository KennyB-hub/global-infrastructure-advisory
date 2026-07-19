export class RemediationEngine {
  plan(violations: any[]) {
    return violations.map(v => {
      // Determine domain from violation shape
      const domain = this.detectDomain(v);

      // Map domain → correct audit log target
      const target = this.resolveTarget(domain);

      return {
        id: this.buildId(v, domain),
        type: 'REPORT',
        target,
        payload: v
      };
    });
  }

  private detectDomain(v: any): 'rf' | 'emergency' | 'network' {
    if (v.deviceId && v.observed?.profile && v.observed?.behavior) return 'rf';
    if (v.deviceId && v.observed?.events && v.observed?.fallbacks) return 'emergency';
    if (v.towerId && v.observed?.tower && v.observed?.events) return 'network';
    return 'network'; // default fallback
  }

  private resolveTarget(domain: 'rf' | 'emergency' | 'network') {
    switch (domain) {
      case 'rf':
        return 'fcc_audit_log';
      case 'emergency':
        return 'emergency_access_audit_log';
      case 'network':
        return 'carrier_network_audit_log';
    }
  }

  private buildId(v: any, domain: 'rf' | 'emergency' | 'network') {
    if (domain === 'network') return `${v.towerId}:${v.ruleId}`;
    return `${v.deviceId}:${v.ruleId}`;
  }
}
