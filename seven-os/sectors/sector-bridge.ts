// sectors/sector-bridge.ts

export type SectorId =
  | "agriculture"
  | "mining"
  | "disaster_response"
  | "telecom"
  | "ports"
  | "roads"
  | "rail"
  | "water"
  | "power"
  | "public_safety"
  | "government"
  | "cyber"
  | "logistics"
  | "fcc"
  | "cloud"
  | "construction"
  | "healthcare"
  | "geospatial"
  | "education"
  | "finance"
  | "transportation"
  | "environmental"
  | "emergency_services";
  

export interface SectorEvent {
  sector: SectorId;
  type: string;
  payload: unknown;
  timestamp: string;
  origin: "ground-unit" | "drone" | "grid" | "operator";
}

export type SectorHandler = (event: SectorEvent) => Promise<void>;

const sectorHandlers: Partial<Record<SectorId, SectorHandler>> = {};

export function registerSectorHandler(sector: SectorId, handler: SectorHandler) {
  sectorHandlers[sector] = handler;
}

export async function routeSectorEvent(event: SectorEvent): Promise<void> {
  const handler = sectorHandlers[event.sector];
  if (!handler) {
    // No handler registered: log, drop, or send to governance
    console.warn("[sector-bridge] No handler for sector:", event.sector, event);
    return;
  }
  await handler(event);
}
