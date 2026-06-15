const writeReport = require("../utilities/write-report.cjs");
const fs = require("fs");
const path = require("path");

function rebuildRouting() {
  const routing = {
    timestamp: new Date().toISOString(),
    sectors: [],
    apis: [],
    workers: []
  };

  // Scan sectors
  const sectorsDir = path.join(process.cwd(), "seven-os", "sectors");
  if (fs.existsSync(sectorsDir)) {
    routing.sectors = fs.readdirSync(sectorsDir).filter(f => !f.startsWith("."));
  }

  // Scan API folder
  const apiDir = path.join(process.cwd(), "seven-os", "api");
  if (fs.existsSync(apiDir)) {
    routing.apis = fs.readdirSync(apiDir).filter(f => f.endsWith(".js") || f.endsWith(".ts"));
  }

  // Scan workers
  const workersDir = path.join(process.cwd(), "seven-os", "workers");
  if (fs.existsSync(workersDir)) {
    routing.workers = fs.readdirSync(workersDir).filter(f => !f.startsWith("."));
  }

  writeReport("routing-map.json", routing);
}

rebuildRouting();
