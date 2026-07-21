import {
  GovernanceRule,
  DeviceRFProfile,
  BehaviorSample,
  GovernanceViolation,
} from '../../governance/types.js';
import { GovernanceBrain } from '../../../../workers/finance/index.ts';

export interface ComplianceEngine {
  evaluateDevice(
    profile: DeviceRFProfile,
    behavior: BehaviorSample[],
  ): GovernanceViolation[];
}

export class SimpleComplianceEngine implements ComplianceEngine {
  constructor(private brain: GovernanceBrain) {}

  evaluateDevice(
    profile: DeviceRFProfile,
    behavior: BehaviorSample[],
  ): GovernanceViolation[] {
    const rfRules = this.brain.getRulesByDomain('rf');
    const violations: GovernanceViolation[] = [];

    // placeholder: plug in real rule logic later
    for (const rule of rfRules) {
      // TODO: evaluate rule.conditions vs profile/behavior
      const violated = false;

      if (violated) {
        violations.push({
          ruleId: rule.id,
          deviceId: profile.deviceId,
          severity: 'HIGH',
          expected: rule.expectations,
          observed: { profile, behavior },
          timestamp: new Date().toISOString(),
        });
      }
    }

    return violations;
  }
}
