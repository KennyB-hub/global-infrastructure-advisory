import { InMemoryGovernanceBrain } from '../governance-brain';
import { InMemoryRFObservationLayer } from './governance-brain/rf-observation-layer';
import { SimpleComplianceEngine } from './governance-brain/compliance-engine';
import { SimpleFirmwareAuditor } from './governance-brain/firmware-auditor';
import { SimpleRemediationEngine } from './governance-brain/remediation-engine';
import { LoggingWorkforceSync } from './core/AI-workforce-sync-layer';

export function createTelecomEquipmentAuthorizationEngine() {
  const brain = new InMemoryGovernanceBrain();
  const rfObs = new InMemoryRFObservationLayer();
  const compliance = new SimpleComplianceEngine(brain);
  const firmwareAuditor = new SimpleFirmwareAuditor(compliance);
  const remediation = new SimpleRemediationEngine();
  const workforce = new LoggingWorkforceSync();

  return {
    brain,
    rfObs,
    compliance,
    firmwareAuditor,
    remediation,
    workforce,
  };
}
