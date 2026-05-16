import { TowerTelemetry, InfraEvent } from "./types";
import { v4 as uuid } from "uuid";

export function auditTower(t: TowerTelemetry): InfraEvent[] {
  const events: InfraEvent[] = [];
  const now = new Date().toISOString();

  const push = (type: InfraEvent["type"], issue: string, extra: Record<string, any> = {}) => {
    events.push({
      id: uuid(),
      timestamp: now,
      sector: "tower",
      type,
      source: "tower-audit",
      location: { lat: t.lat, lon: t.lon, zone: t.zone },
      payload: { towerId: t.towerId, issue, ...extra },
    });
  };

  // Backhaul congestion
  if ((t.backhaulUtilization ?? 0) > 0.9) {
    push("warning", "backhaul_congestion", { utilization: t.backhaulUtilization });
  }

  // Chronic outages
  if ((t.outageMinutesLast24h ?? 0) > 30) {
    push("warning", "chronic_outage", { outageMinutesLast24h: t.outageMinutesLast24h });
  }

  // Thermal risk
  if ((t.tempC ?? 0) > 75) {
    push("critical", "thermal_risk", { tempC: t.tempC });
  }

  // “Funded but not real” upgrade
  if (t.fundedUpgrade && t.upgradeClaimedComplete && (t.backhaulUtilization ?? 0) > 0.85) {
    push("warning", "suspect_upgrade_claim", {
      utilization: t.backhaulUtilization,
      fundedUpgrade: t.fundedUpgrade,
      upgradeClaimedComplete: t.upgradeClaimedComplete,
    });
  }

  return events;
}
