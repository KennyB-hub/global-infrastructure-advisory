export class RemediationEngine {
  plan(violations: any[]) {
    return violations.map(v => ({
      id: `${v.deviceId}:${v.ruleId}`,
      type: 'REPORT',
      target: 'fcc_audit_log',
      payload: v
    }));
  }
}
