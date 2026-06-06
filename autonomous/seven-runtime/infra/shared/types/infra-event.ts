// autonomous/infra/shared/types/infra-event.ts
export type InfraEvent = {
  id: string;
  timestamp: string;
  sector: "tower" | "fiber" | "power" | "ems" | "ag";
  type: "info" | "warning" | "critical";
  source: string;
  location?: { lat: number; lon: number; zone?: string };
  payload: Record<string, any>;
};
