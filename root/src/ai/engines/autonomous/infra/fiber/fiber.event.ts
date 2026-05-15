type FiberEvent = {
  id: string;
  timestamp: string;
  sector: "tower" | "fiber" | "power" | "ems" | "ag" | "system";
  type: "info" | "warning" | "critical";
  source: string;
  location?: { lat: number; lon: number; zone?: string };
  payload: Record<string, any>;
};
{
  sector: "fiber",
  type: "warning",
  source: "fiber-audit",
  payload: { segmentId: "FBR-12", issue: "missing_segment" }
}
