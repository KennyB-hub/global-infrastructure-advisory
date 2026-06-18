import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "seven-os/domains");
const REGISTRY = path.join(process.cwd(), "seven-os/manifest/sector-registry.json");
const WORKER_TABLE = path.join(process.cwd(), "seven-os/manifest/sector-worker-table.json");

export interface SectorDefinition {
  id: string;
  enabled: boolean;
  path: string;
  workers: string[];
  family?: string;
}

export function loadSectorRegistry(): Record<string, any> {
  if (!fs.existsSync(REGISTRY)) return {};
  return JSON.parse(fs.readFileSync(REGISTRY, "utf8"));
}

export function loadWorkerTable(): Record<string, any> {
  if (!fs.existsSync(WORKER_TABLE)) return {};
  return JSON.parse(fs.readFileSync(WORKER_TABLE, "utf8"));
}

export function listSectors(): SectorDefinition[] {
  const registry = loadSectorRegistry();
  const workerTable = loadWorkerTable();

  const sectors: SectorDefinition[] = [];

  for (const sectorId of Object.keys(registry)) {
    const sectorPath = path.join(ROOT, sectorId);

    sectors.push({
      id: sectorId,
      enabled: registry[sectorId].enabled ?? true,
      path: sectorPath,
      workers: workerTable[sectorId]?.workers ?? [],
      family: registry[sectorId].family ?? null
    });
  }

  return sectors;
}

export function getSector(id: string): SectorDefinition | null {
  const sectors = listSectors();
  return sectors.find(s => s.id === id) || null;
}

export function getEnabledSectors(): SectorDefinition[] {
  return listSectors().filter(s => s.enabled);
}
