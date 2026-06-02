import { TowerTelemetry } from "./types";

export async function fetchTowerTelemetry(): Promise<TowerTelemetry[]> {
  // Day 1: stub / fake data
  return [
    {
      towerId: "RT20-001",
      lat: 39.0,
      lon: -80.2,
      zone: "RT20",
      backhaulUtilization: 0.93,
      cpuLoad: 0.81,
      tempC: 78,
      outageMinutesLast24h: 45,
      fundedUpgrade: true,
      upgradeClaimedComplete: true,
    },
  ];
}
