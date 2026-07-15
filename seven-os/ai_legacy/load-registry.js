// load-registry.js
// V12 Alpha – Cattle Load Registry
import { createLoad, listLoads, updateLoadStatus } from "./load-registry.js";
import { matchHaulersForLoad } from "./load-matching-engine.js";

const fs = require("fs");
const path = require("path");

const REGISTRY_PATH = path.join(process.cwd(), "data/load-registry.json");

if (!fs.existsSync(REGISTRY_PATH)) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify({ loads: [] }, null, 2));
}

function loadRegistry() {
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
}

function saveRegistry(registry) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

function createLoad(load) {
  const registry = loadRegistry();

  const newLoad = {
    id: `LOAD_${Date.now()}`,
    farmerName: load.farmerName,
    contactPhone: load.contactPhone,
    origin: load.origin,           // e.g. "WV"
    destination: load.destination, // e.g. "NE"
    headCount: load.headCount,
    weightClass: load.weightClass, // e.g. "feeder", "fat", "calves"
    earliestPickup: load.earliestPickup,
    latestPickup: load.latestPickup,
    notes: load.notes || "",
    status: "open",                // open | matched | completed | cancelled
    createdAt: new Date().toISOString()
  };

  registry.loads.push(newLoad);
  saveRegistry(registry);

  return newLoad;
}

function listLoads() {
  return loadRegistry().loads;
}

function getLoadById(id) {
  return loadRegistry().loads.find((l) => l.id === id) || null;
}

function updateLoadStatus(id, status) {
  const registry = loadRegistry();
  const load = registry.loads.find((l) => l.id === id);
  if (!load) throw new Error("Load not found");

  load.status = status;
  saveRegistry(registry);

  return load;
}

module.exports = {
  createLoad,
  listLoads,
  getLoadById,
  updateLoadStatus
};
