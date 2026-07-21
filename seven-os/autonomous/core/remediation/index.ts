import { GovernanceViolation } from '../fcc/carrier-network-compliance/governance-brain/types';

export interface RemediationAction {
  id: string;
  type: 'NOTIFY' | 'RECONFIGURE' | 'BLOCK' | 'REPORT';
  target: string;
  payload: any;
}

export interface RemediationEngine {
  plan(violations: GovernanceViolation[]): RemediationAction[];
}

export class SimpleRemediationEngine implements RemediationEngine {
  plan(violations: GovernanceViolation[]): RemediationAction[] {
    return violations.map(v => ({
      id: `${v.deviceId}:${v.ruleId}`,
      type: 'REPORT',
      target: 'fcc_audit_log',
      payload: v,
    }));
  }
}
