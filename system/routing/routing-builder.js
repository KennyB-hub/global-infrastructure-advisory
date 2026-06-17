function buildRoutingMaps(classified) {
  return {
    aiRouting: classified.ai,
    apiRouting: classified.api,
    systemRouting: classified.system,
    workerRouting: classified.workers,
    sectorRouting: classified.sectors,
    coreRouting: classified.core,
    dataRouting: classified.data
  };
}

module.exports = { buildRoutingMaps };
