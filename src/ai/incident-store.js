// incident-store.js
// V12 Alpha – Incident Store (File-backed)

const fs = require("fs");
const path = require("path");

const INCIDENTS_DIR = path.join(process.cwd(), "logs/incidents");

if (!fs.existsSync(INCIDENTS_DIR)) {
  fs.mkdirSync(INCIDENTS_DIR, { recursive: true });
}

function createIncident(incident) {
  const id = `INC_${Date.now()}`;
  const filePath = path.join(INCIDENTS_DIR, `${id}.json`);

  const record = {
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "open", // open | investigating | mitigated | closed
    ...incident
  };

  fs.writeFileSync(filePath, JSON.stringify(record, null, 2));
  return record;
}

function updateIncident(id, updates) {
  const filePath = path.join(INCIDENTS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Incident not found: ${id}`);
  }

  const existing = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const updated = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
  return updated;
}

function listIncidents() {
  const files = fs.readdirSync(INCIDENTS_DIR).filter((f) => f.endsWith(".json"));
  return files.map((file) =>
    JSON.parse(fs.readFileSync(path.join(INCIDENTS_DIR, file), "utf8"))
  );
}

module.exports = {
  createIncident,
  updateIncident,
  listIncidents
};
