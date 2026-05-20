import { InfraEvent } from "../../shared/types/infra-event";
import { makeEvent } from "../../shared/utils/events";

export type FenceEvent = {
  herdId: string;
  lat: number;
  lon: number;
  zone?: string;
  insideFence: boolean;
  driftMeters?: number;
  baseStationOnline: boolean;
  collarBatteryPct?: number;
};

export function auditVirtualFence(f: FenceEvent): InfraEvent[] {
  const events: InfraEvent[] = [];
  const loc = { lat: f.lat, lon: f.lon, zone: f.zone };

  // Fence breach
  if (!f.insideFence) {
    events.push(
      makeEvent("ag", "critical", "virtual-fence-audit", loc, {
        herdId: f.herdId,
        issue: "fence_breach",
        driftMeters: f.driftMeters,
      })
    );
  }

  // GNSS drift warning
  if ((f.driftMeters ?? 0) > 10 && f.insideFence) {
    events.push(
      makeEvent("ag", "warning", "virtual-fence-audit", loc, {
        herdId: f.herdId,
        issue: "gnss_drift",
        driftMeters: f.driftMeters,
      })
    );
  }

  // Base station offline
  if (!f.baseStationOnline) {
    events.push(
      makeEvent("ag", "warning", "virtual-fence-audit", loc, {
        herdId: f.herdId,
        issue: "base_station_offline",
      })
    );
  }

  // Low battery
  if ((f.collarBatteryPct ?? 100) < 20) {
    events.push(
      makeEvent("ag", "warning", "virtual-fence-audit", loc, {
        herdId: f.herdId,
        issue: "low_collar_battery",
        collarBatteryPct: f.collarBatteryPct,
      })
    );
  }

  return events;
}
