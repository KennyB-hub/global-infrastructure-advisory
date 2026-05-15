type AgEvent = {
  id: string;
  timestamp: string;
  sector: "tower" | "fiber" | "power" | "ems" | "ag" | "system";
  type: "info" | "warning" | "critical";
  source: string;
  location?: { lat: number; lon: number; zone?: string };
  payload: Record<string, any>;
};
{
  sector: "ag",
  type: "critical",
  source: "virtual-fence-audit",
  payload: { herdId: "HERD-A", issue: "fence_breach" }
},
{
  sector: "ag",
  type: "warning",
  source: "livestock-audit",
  payload: { herdId: "HERD-B", issue: "heat_stress" }
}
