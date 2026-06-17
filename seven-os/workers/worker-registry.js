/**
 * Universal Worker Registry (JavaScript)
 * Seven‑OS Worker Registration Layer
 */

const registry = {};

function registerWorker(entry) {
  registry[entry.id] = entry;
}

function getWorker(id) {
  return registry[id];
}

function listWorkers() {
  return Object.values(registry);
}

module.exports = {
  registerWorker,
  getWorker,
  listWorkers,
};
