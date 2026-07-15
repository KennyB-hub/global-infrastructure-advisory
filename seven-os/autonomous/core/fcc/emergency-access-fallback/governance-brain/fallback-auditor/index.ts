import { ComplianceEngine } from '../compliance-engine';

export class FallbackAuditor {
  constructor(private compliance: ComplianceEngine) {}

  evaluateFallback(deviceId: string) {
    return this.compliance.evaluate(deviceId);
  }
}
