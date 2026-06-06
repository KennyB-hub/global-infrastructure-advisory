import { InfraEvent } from "../shared/types/infra-event";
import { makeEvent } from "../shared/utils/events";

export type PowerSpan = {
  lineId: string;
  lat: number;
  lon: number;
  zone?: string;
  tempC?: number;
  vegetationRisk?: "low" | "medium" | "high";
  sagMeters?: number;
  faultsLast12m?: number;
  windKph?: number;
  humidityPct?: number;
};

export function auditPower(span: PowerSpan): InfraEvent[] {
  const events: InfraEvent[] = [];
  const loc = { lat: span.lat, lon: span.lon, zone: span.zone };

  // Fire risk combo
  const fireRisk =
    (span.tempC ?? 0) > 80 &&
    (span.vegetationRisk === "high") &&
    (span.windKph ?? 0) > 25 &&
    (span.humidityPct ?? 100) < 30;

  if (fireRisk) {
    events.push(
      makeEvent("power", "critical", "power-audit", loc, {
        lineId: span.lineId,
        issue: "fire_risk",
        tempC: span.tempC,
        vegetationRisk: span.vegetationRisk,
        windKph: span.windKph,
        humidityPct: span.humidityPct,
      })
    );
  }

  // Sagging span
  if ((span.sagMeters ?? 0) > 2.0) {
    events.push(
      makeEvent("power", "warning", "power-audit", loc, {
        lineId: span.lineId,
        issue: "excessive_sag",
        sagMeters: span.sagMeters,
      })
    );
  }

  // Repeat faults
  if ((span.faultsLast12m ?? 0) > 3) {
    events.push(
      makeEvent("power", "warning", "power-audit", loc, {
        lineId: span.lineId,
        issue: "repeat_faults",
        faultsLast12m: span.faultsLast12m,
      })
    );
  }

  return events;
}
