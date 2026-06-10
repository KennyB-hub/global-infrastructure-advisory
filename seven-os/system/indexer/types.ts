// seven-os/system/indexer/types.ts

export type EngineKind =
  | "os-engine"
  | "runtime-worker"
  | "dashboard"
  | "api"
  | "voice"
  | "data";

export interface EngineDescriptor {
  id: string;
  name: string;
  kind: EngineKind;
  sector: string | null;
  path: string;
  trustZone: string;
  autonomyLevel: number;
}

export interface GlobalManifest {
  version: string;
  generated_at: string;
  engines: EngineDescriptor[];
}
