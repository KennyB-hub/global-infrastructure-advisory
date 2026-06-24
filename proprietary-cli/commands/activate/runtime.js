export function activateRuntime(manifest) {
  return {
    status: "online",

    version: manifest.version,
    systemVersion: manifest.system_version,

    sectors: Object.keys(manifest.sectors),
    trustZones: manifest.trust_zones,

    engines: manifest.engines["engine-index"].engines,
    workers: manifest.workers.index.workers,

    topology: manifest.topology.nodes,
    infrastructurePacks: manifest.infrastructure_packs,

    sandbox: manifest.sandbox,
    logging: manifest.logging
  };
}

