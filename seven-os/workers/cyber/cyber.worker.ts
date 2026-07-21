import { DroneTelemetry } from "../../financial/drone/drone-telemetry";
import { DamageClassifier } from "../../financial/drone/damage-classifier";
import { CostEstimator } from "../../financial/drone/cost-estimator";
import { InfrastructureLoader } from "../../infrastructure-packs/infrastructure-loader";

import { CyberEscalation } from "./cyber.escalation";
import { CyberThreatIntelEngine } from "./cyber.threat-intel";
import { CyberTelemetryNormalizer } from "./cyber.normalizer";

export default {
  /**
   * Cyber Worker
   * Handles cyber incidents, telemetry, threat classification,
   * cost estimation, intel enrichment, and escalation.
   */
  async handle(event: any) {
    const { type, payload } = event;

    switch (type) {
      case "cyber.telemetry":
        return await this.processTelemetry(payload);

      case "cyber.incident":
        return await this.processIncident(payload);

      case "cyber.status":
        return await this.status();

      default:
        return { error: `Unknown cyber worker event type: ${type}` };
    }
  },

  /**
   * Process cyber telemetry (logs, alerts, IDS/IPS signals, etc.)
   */
  async processTelemetry(payload: any) {
    // Normalize raw logs
    const normalized = CyberTelemetryNormalizer.normalize(payload);

    // Enrich with threat intel
    const intel = await CyberThreatIntelEngine.enrich(normalized);

    // Classify using cyber infrastructure pack
    const classification = await DamageClassifier.classify(normalized);

    // Estimate cost
    const cost = await CostEstimator.estimate(normalized);

    // Escalation logic
    if (CyberEscalation.shouldEscalate(intel, classification)) {
      return CyberEscalation.buildPayload(payload, intel, classification);
    }

    return {
      worker: "cyber",
      event: "telemetry_processed",
      normalized,
      intel,
      classification,
      cost,
      recommendedAction: this.recommendAction(classification)
    };
  },

  /**
   * Process a direct cyber incident report
   */
  async processIncident(incident: any) {
    const infra = await InfrastructureLoader.getDomain("cyber");

    const failure = infra.failureModes.find(
      (f: any) => f.name === incident.type
    );

    if (!failure) {
      return {
        worker: "cyber",
        event: "incident_unknown",
        message: `Unknown cyber incident type: ${incident.type}`
      };
    }

    const repair = infra.repairModels[incident.type];
    const costRules = infra.costs;

    const estimatedCost =
      repair.laborHours * costRules.labor.incident_responder_hour +
      (repair.equipmentDays > 0
        ? repair.equipmentDays *
          costRules.equipment[repair.equipmentType]
        : 0);

    return {
      worker: "cyber",
      event: "incident_processed",
      failureMode: failure.name,
      severity: failure.severity,
      estimatedCost,
      timeToRepair: repair.time,
      steps: repair.steps,
      recommendedAction: this.recommendAction(failure)
    };
  },

  /**
   * Worker status
   */
  async status() {
    return {
      worker: "cyber",
      status: "online",
      timestamp: Date.now()
    };
  },

  /**
   * Recommend action based on severity
   */
  recommendAction(failure: any) {
    switch (failure.severity) {
      case "Critical":
        return "Immediate isolation, incident response activation, and forensic review";

      case "Severe":
        return "Segment affected systems and initiate containment procedures";

      case "Moderate":
        return "Review logs, rotate credentials, and increase monitoring";

      case "Minor":
      default:
        return "Monitor and verify integrity of affected systems";
    }
  }
};
