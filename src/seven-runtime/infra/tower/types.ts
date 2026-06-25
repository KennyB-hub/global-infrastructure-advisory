export type InfraEvent = {
  id: string;
  timestamp: string;
  sector: "tower";
  type: "info" | "warning" | "critical";
  source: string;
  location?: { lat: number; lon: number; zone?: string };
  payload: Record<string, any>;
};

export type TowerTelemetry = {
  towerId: string;
  lat: number;
  lon: number;
  zone?: string;
  rssi?: number;
  sinr?: number;
  throughputMbps?: number;
  backhaulUtilization?: number; // 0–1
  cpuLoad?: number;             // 0–1
  tempC?: number;
  outageMinutesLast24h?: number;
  fundedUpgrade?: boolean;
  upgradeClaimedComplete?: boolean;
};
