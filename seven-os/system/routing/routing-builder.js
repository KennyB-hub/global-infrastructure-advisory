function buildRoutingMaps(classified) {
  const sectorWorkerLinks = [];

  const sectors = classified.sectors || [];
  const workers = classified.workers || [];

  sectors.forEach(file => {
    const match = file.match(/\/sectors\/([^/]+)\//);
    if (match) {
      const sectorName = match[1];
      const linkedWorkers = workers.filter(w =>
        w.includes(`/system-workers/${sectorName}-workers/`) ||
        w.includes(`/workers/system-workers/${sectorName}-workers/`)
      );

      sectorWorkerLinks.push({
        sector: sectorName,
        sectorFile: file,
        workers: linkedWorkers,
      });
    }
  });

  return {
    aiRouting: classified.ai,
    apiRouting: classified.api,
    systemRouting: classified.system,
    workerRouting: classified.workers,
    sectorRouting: classified.sectors,
    coreRouting: classified.core,
    dataRouting: classified.data,
    sectorWorkerLinks,
  };
}

module.exports = { buildRoutingMaps };
