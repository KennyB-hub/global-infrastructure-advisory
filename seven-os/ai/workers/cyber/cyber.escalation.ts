// cyber.escalation.ts – V12 Alpha
// Handles escalation from Cyber Worker → Gov Worker

import { ThreatIntelResult } from "./cyber.threat-intel";

export class CyberEscalation {
  /**
   * Decide whether to escalate to Gov Worker
   */
  static shouldEscalate(intel: ThreatIntelResult, failure: any): boolean {
    if (!intel || !failure) return false;

    // Critical severity ALWAYS escalates
    if (failure.severity === "Critical") return true;

    // Malicious intel score escalates
    if (intel.category === "malicious") return true;

    // High severity + suspicious intel escalates
    if (failure.severity === "Severe" && intel.category === "suspicious") {
      return true;
    }

    return false;
  }

  /**
   * Build escalation payload for Gov Worker
   */
  static buildPayload(event: any, intel: ThreatIntelResult, failure: any) {
    return {
      type: "gov.escalation",
      payload: {
        source: "cyber",
        failureMode: failure.name,
        severity: failure.severity,
        intelScore: intel.score,
        intelCategory: intel.category,
        tags: intel.tags,
        matchedIndicators: intel.matchedIndicators,
        notes: intel.notes,
        rawEvent: event
      }
    };
  }
}
