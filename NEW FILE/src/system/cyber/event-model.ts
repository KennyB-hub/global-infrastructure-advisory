export interface CyberEvent {
  source: string;          // worker, engine, api, node
  sector: string;          // public, contractor, farmer, gov, deepgov, admin, system
  trustZone: string;       // anon, user, admin, system
  type: string;            // access_attempt, config_change, anomaly, incident
  severity?: string;       // info, low, medium, high, critical
  metadata?: Record<string, any>;
  timestamp: number;
}
