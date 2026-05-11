// hauler-registry.js
// V12 Alpha – Hauler Discovery Registry

const fs = require("fs");
const path = require("path");

const REGISTRY_PATH = path.join(process.cwd(), "data/hauler-registry.json");

if (!fs.existsSync(REGISTRY_PATH)) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify({ haulers: [] }, null, 2));
}

function loadRegistry() {
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
}

function saveRegistry(registry) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

function registerHauler(hauler) {
  const registry = loadRegistry();

  const newHauler = {
    id: `HAULER_${Date.now()}`,
    name: hauler.name,
    phone: hauler.phone,
    email: hauler.email,
    region: hauler.region, // e.g., WV, OH, PA, KY
    equipment: hauler.equipment, // e.g., "cattle pot", "gooseneck", "double deck"
    capacity: hauler.capacity, // head count
    dotNumber: hauler.dotNumber,
    insurance: hauler.insurance,
    riskScore: hauler.riskScore || 0,
    verified: false,
    createdAt: new Date().toISOString()
  };

  registry.haulers.push(newHauler);
  saveRegistry(registry);

  return newHauler;
}

function listHaulers() {
  return loadRegistry().haulers;
}

function findHaulersByRegion(region) {
  return loadRegistry().haulers.filter((h) => h.region === region);
}

function verifyHauler(id, status = true) {
  const registry = loadRegistry();
  const hauler = registry.haulers.find((h) => h.id === id);
  if (!hauler) throw new Error("Hauler not found");

  hauler.verified = status;
  saveRegistry(registry);

  return hauler;
}

module.exports = {
  registerHauler,
  listHaulers,
  findHaulersByRegion,
  verifyHauler
};
