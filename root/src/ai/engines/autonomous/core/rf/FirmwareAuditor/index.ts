import { DeviceRFProfile, GovernanceViolation } from '../../governance/types';
import { ComplianceEngine } from '../../governance/ComplianceEngine';

export interface FirmwareAuditor {
  evaluateFirmwareChange(
    before: DeviceRFProfile,
    after: DeviceRFProfile,
  ): GovernanceViolation[];
}

export class SimpleFirmwareAuditor implements FirmwareAuditor {
  constructor(private compliance: ComplianceEngine) {}

  evaluateFirmwareChange(
    before: DeviceRFProfile,
    after: DeviceRFProfile,
  ): GovernanceViolation[] {
    // later: diff RF behavior; for now just re‑evaluate "after"
    return this.compliance.evaluateDevice(after, []);
  }
}
