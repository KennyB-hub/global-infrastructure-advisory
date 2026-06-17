/**
 * Seven‑OS Universal Worker Registry + Tracking System (TypeScript)
 */

export interface WorkerRegistration {
  id: string;
  file: string;
  roles: string[];
  capabilities: any;
  routes?: any;
  metadata?: {
    version?: string;
    created?: string;
    updated?: string;
    owner?: string;
  };
}

export interface WorkerState {
  id: string;
  status: "online" | "offline" | "error";
  lastHeartbeat: number;
  load: number;
}

const registry: Record<string, WorkerRegistration> = {};
const workerState: Record<string, WorkerState> = {};

export function registerWorker(entry: WorkerRegistration) {
  registry[entry.id] = entry;

  // Initialize tracking state
  workerState[entry.id] = {
    id: entry.id,
    status: "online",
    lastHeartbeat: Date.now(),
    load: 0,
  };
}

export function heartbeat(id: string, load = 0) {
  if (workerState[id]) {
    workerState[id].lastHeartbeat = Date.now();
    workerState[id].load = load;
  }
}

export function getWorker(id: string) {
  return registry[id];
}

export function listWorkers() {
  return Object.values(registry);
}

export function listWorkerStates() {
  return Object.values(workerState);
}

export function getWorkerState(id: string) {
  return workerState[id];
}

export default {
  registerWorker,
  heartbeat,
  getWorker,
  listWorkers,
  listWorkerStates,
  getWorkerState,
};
