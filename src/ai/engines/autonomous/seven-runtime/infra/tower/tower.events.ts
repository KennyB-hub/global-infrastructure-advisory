type TowerEvent = {
  id: string;
  timestamp: string;
  sector: "tower" | "fiber" | "power" | "ems" | "ag" | "system";
  type: "info" | "warning" | "critical";
  source: string;
  location?: { lat: number; lon: number; zone?: string };
  payload: Record<string, any>;
};
{
  sector: "tower",
  type: "warning",
  source: "tower-audit",
  payload: { towerId, issue: "backhaul_congestion", utilization: 0.93 }
}
