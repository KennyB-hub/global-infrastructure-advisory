import { ComplianceEngine } from '../compliance-engine';

export class FirmwareAuditor {
  constructor(private compliance: ComplianceEngine) {}

  evaluateFirmware(deviceId: string) {
    return this.compliance.evaluate(deviceId);
  }
}
