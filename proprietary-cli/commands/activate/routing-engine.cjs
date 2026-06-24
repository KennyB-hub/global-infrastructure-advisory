const manifest = require("../src/global-manifest.json");

function activateRoutingEngine() {
  return {
    status: "online",
    routes: {
      engines: Object.keys(manifest.engines),
      workers: Object.keys(manifest.workers),
      sectors: Object.keys(manifest.sectors),
      topology: Object.keys(manifest.topology)
    }
  };
}

const routing = activateRoutingEngine();
console.log("Routing Engine:", routing.status);
