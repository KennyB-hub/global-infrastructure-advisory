type EmsEvent = {
  id: string;
  timestamp: string;
  sector: "tower" | "fiber" | "power" | "ems" | "ag" | "system";
  type: "info" | "warning" | "critical";
  source: string;
  location?: { lat: number; lon: number; zone?: string };
  payload: Record<string, any>;
};
{
  sector: "ems",
  type: "warning",
  source: "ems-audit",
  payload: { repeaterId: "EMS-RT20", issue: "coverage_gap" }
}

