import { GovernanceBrain } from '../governance-brain';
import { RFObservationLayer } from './rf-observation-layer';
import { EmergencyObservationLayer } from './emergency-observation-layer';
import { NetworkObservationLayer } from './network-observation-layer';

import {
  DeviceRFProfile,
  BehaviorSample,
  GovernanceViolation,
} from './types';

type ComplianceDomain = 'rf' | 'emergency' | 'network';

export class ComplianceEngine {
  private rf?: RFObservationLayer;
  private emergency?: EmergencyObservationLayer;
  private network?: NetworkObservationLayer;

  constructor(
    private brain: GovernanceBrain,
    layers: {
      rf?: RFObservationLayer;
      emergency?: EmergencyObservationLayer;
      network?: NetworkObservationLayer;
    }
  ) {
    this.rf = layers.rf;
    this.emergency = layers.emergency;
    this.network = layers.network;
  }

  // ---------------------------------------------------------------------------
  // 1. FULL FCC COMPLIANCE API
  // ---------------------------------------------------------------------------
  evaluate(id: string, domain: ComplianceDomain): GovernanceViolation[] {
    const rules = this.brain.getRulesByDomain(domain);
    const violations: GovernanceViolation[] = [];

    let observed: any = {};

    // --- RF DOMAIN ---------------------------------------------------------
    if (domain === 'rf') {
      if (!this.rf) throw new Error('RFObservationLayer not provided');

      observed = {
        profile: this.rf.getProfile(id),
        behavior: this.rf.getBehavior(id),
      };
    }

    // --- EMERGENCY DOMAIN --------------------------------------------------
    if (domain === 'emergency') {
      if (!this.emergency) throw new Error('EmergencyObservationLayer not provided');

      observed = {
        events: this.emergency.getEvents(id),
        fallbacks: this.emergency.getFallbacks(id),
      };
    }

    // --- NETWORK DOMAIN ----------------------------------------------------
    if (domain === 'network') {
      if (!this.network) throw new Error('NetworkObservationLayer not provided');

      observed = {
        tower: this.network.getTower(id),
        events: this.network.getEvents(id),
      };
    }

    // --- RULE EVALUATION ---------------------------------------------------
    for (const rule of rules) {
      const violated = false; // placeholder for real logic

      if (violated) {
        violations.push({
          ruleId: rule.id,
          deviceId: id,
          severity: domain === 'emergency' ? 'CRITICAL' : 'HIGH',
          expected: rule.expectations,
          observed,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return violations;
  }

  // ---------------------------------------------------------------------------
  // 2. SIMPLE RF API (backwards compatible)
  // ---------------------------------------------------------------------------
  evaluateDevice(
    profile: DeviceRFProfile,
    behavior: BehaviorSample[],
  ): GovernanceViolation[] {
    const rfRules = this.brain.getRulesByDomain('rf');
    const violations: GovernanceViolation[] = [];

    for (const rule of rfRules) {
      const violated = false; // placeholder for real logic

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
