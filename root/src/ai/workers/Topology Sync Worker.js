export function topologySyncWorker(eventStream, topologyIndex, fileLoader, fileWriter) {
  const events = eventStream.getPendingEvents();

  for (const event of events) {
    const { type, regionId, payload } = event;

    const topology = fileLoader(topologyIndex.files.globalMap);
    const region = topology.regions.find(r => r.id === regionId);

    if (!region) continue;

    switch (type) {
      case "DISASTER_FLAG":
        region.status.disaster = payload.active;
        break;

      case "WAR_ZONE_FLAG":
        region.status.warZone = payload.active;
        break;

      case "SUPPLY_CHAIN_UPDATE":
        region.supplyChain.status = payload.status;
        break;

      case "ADD_HUMANITARIAN_ORG":
        region.humanitarian.push(payload.org);
        break;

      case "ADD_CONTRACTOR":
        region.workforce.contractors.push(payload.contractor);
        break;

      case "ADD_PUBLIC_WORKER":
        region.workforce.public.push(payload.worker);
        break;

      case "ADD_NODE":
        region.nodes.push(payload.node);
        break;
    }

    fileWriter(topologyIndex.files.globalMap, topology);
  }

  return { synced: true, updatedEvents: events.length };
}
