type PowerEvent = {
  id: string;
  timestamp: string;
  sector: "tower" | "fiber" | "power" | "ems" | "ag" | "system";
  type: "info" | "warning" | "critical";
  source: string;
  location?: { lat: number; lon: number; zone?: string };
  payload: Record<string, any>;
};
{
  sector: "power",
  type: "critical",
  source: "power-audit",
  payload: { lineId: "PWR-88", issue: "fire_risk" }
}
