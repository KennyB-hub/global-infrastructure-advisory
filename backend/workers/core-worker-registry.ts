/**
 * Universal Worker Registry (TypeScript)
 * Seven‑OS Worker Registration Layer
 */

export interface WorkerRegistration {
  id: string;
  file: string;
  roles: string[];
  capabilities: any;
  routes?: any;
}

const registry: Record<string, WorkerRegistration> = {};

export function registerWorker(entry: WorkerRegistration) {
  registry[entry.id] = entry;
}

export function getWorker(id: string) {
  return registry[id];
}

export function listWorkers() {
  return Object.values(registry);
}

export default {
  registerWorker,
  getWorker,
  listWorkers,
};
