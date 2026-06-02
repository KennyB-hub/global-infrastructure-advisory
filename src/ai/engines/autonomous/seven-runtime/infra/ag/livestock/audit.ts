import { InfraEvent } from "../../shared/types/infra-event";
import { makeEvent } from "../../shared/utils/events";

export type HerdStatus = {
  herdId: string;
  lat: number;
  lon: number;
  zone?: string;
  avgTempC?: number;
  movementVariance?: number;   // low movement = possible illness/stress
  waterSourceOnline: boolean;
  predatorDetected?: boolean;
};

export function auditLivestock(h: HerdStatus): InfraEvent[] {
  const events: InfraEvent[] = [];
  const loc = { lat: h.lat, lon: h.lon, zone: h.zone };

  // Heat stress
  if ((h.avgTempC ?? 0) > 39) {
    events.push(
      makeEvent("ag", "warning", "livestock-audit", loc, {
        herdId: h.herdId,
        issue: "heat_stress",
        avgTempC: h.avgTempC,
      })
    );
  }

  // Abnormal low movement
  if ((h.movementVariance ?? 1) < 0.2) {
    events.push(
      makeEvent("ag", "warning", "livestock-audit", loc, {
        herdId: h.herdId,
        issue: "low_movement",
        movementVariance: h.movementVariance,
      })
    );
  }

  // Water failure
  if (!h.waterSourceOnline) {
    events.push(
      makeEvent("ag", "critical", "livestock-audit", loc, {
        herdId: h.herdId,
        issue: "water_source_failure",
      })
    );
  }

  // Predator alert
  if (h.predatorDetected) {
    events.push(
      makeEvent("ag", "critical", "livestock-audit", loc, {
        herdId: h.herdId,
        issue: "predator_alert",
      })
    );
  }

  return events;
}
