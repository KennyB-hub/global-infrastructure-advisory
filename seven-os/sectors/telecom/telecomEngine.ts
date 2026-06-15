import { InMemoryGovernanceBrain } from './core/governance/GovernanceBrain';
import { InMemoryRFObservationLayer } from './core/rf/RFObservationLayer';
import { SimpleComplianceEngine } from './core/governance/ComplianceEngine';
import { SimpleFirmwareAuditor } from './core/rf/FirmwareAuditor';
import { SimpleRemediationEngine } from './core/remediation/RemediationEngine';
import { LoggingWorkforceSync } from './core/workforce/AIWorkforceSyncLayer';

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
