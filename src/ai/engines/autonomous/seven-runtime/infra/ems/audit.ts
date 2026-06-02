import { InfraEvent } from "../shared/types/infra-event";
import { makeEvent } from "../shared/utils/events";

export type RepeaterHealth = {
  repeaterId: string;
  lat: number;
  lon: number;
  zone?: string;
  callDropRate?: number;      // 0–1
  busyPct?: number;           // 0–1
  offlineMinutesLast30d?: number;
  stormSensitive?: boolean;
};

export function auditEMS(r: RepeaterHealth): InfraEvent[] {
  const events: InfraEvent[] = [];
  const loc = { lat: r.lat, lon: r.lon, zone: r.zone };

  // Coverage / reliability issue
  if ((r.callDropRate ?? 0) > 0.15) {
    events.push(
      makeEvent("ems", "warning", "ems-audit", loc, {
        repeaterId: r.repeaterId,
        issue: "high_call_drop_rate",
        callDropRate: r.callDropRate,
      })
    );
  }

  // Overloaded repeater
  if ((r.busyPct ?? 0) > 0.8) {
    events.push(
      makeEvent("ems", "warning", "ems-audit", loc, {
        repeaterId: r.repeaterId,
        issue: "overloaded_repeater",
        busyPct: r.busyPct,
      })
    );
  }

  // Chronic outages
  if ((r.offlineMinutesLast30d ?? 0) > 60) {
    events.push(
      makeEvent("ems", "warning", "ems-audit", loc, {
        repeaterId: r.repeaterId,
        issue: "chronic_outage",
        offlineMinutesLast30d: r.offlineMinutesLast30d,
      })
    );
  }

  // Storm sensitivity
  if (r.stormSensitive && (r.callDropRate ?? 0) > 0.1) {
    events.push(
      makeEvent("ems", "warning", "ems-audit", loc, {
        repeaterId: r.repeaterId,
        issue: "storm_sensitive_site",
        callDropRate: r.callDropRate,
        stormSensitive: r.stormSensitive,
      })
    );
  }

  return events;
}
