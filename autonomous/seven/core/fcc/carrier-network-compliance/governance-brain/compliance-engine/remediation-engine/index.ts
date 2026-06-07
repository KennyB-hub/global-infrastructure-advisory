export class RemediationEngine {
  plan(violations: any[]) {
    return violations.map(v => ({
      id: `${v.towerId}:${v.ruleId}`,
      type: 'REPORT',
      target: 'carrier_network_audit_log',
      payload: v
    }));
  }
}
