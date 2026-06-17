/**
 * Seven‑OS Universal Worker Registry + Tracking System (JavaScript)
 */

const registry = {};
const workerState = {};

function registerWorker(entry) {
  registry[entry.id] = entry;

  workerState[entry.id] = {
    id: entry.id,
    status: "online",
    lastHeartbeat: Date.now(),
    load: 0,
  };
}

function heartbeat(id, load = 0) {
  if (workerState[id]) {
    workerState[id].lastHeartbeat = Date.now();
    workerState[id].load = load;
  }
}

function getWorker(id) {
  return registry[id];
}

function listWorkers() {
  return Object.values(registry);
}

function listWorkerStates() {
  return Object.values(workerState);
}

function getWorkerState(id) {
  return workerState[id];
}

module.exports = {
  registerWorker,
  heartbeat,
  getWorker,
  listWorkers,
  listWorkerStates,
  getWorkerState,
};
