// Cross-Sector Routing Engine (infrastructure, energy, water, transport, public, gov)

import { loadAllLogs, loadLogFile } from "../../logs/log-loader.js";
import { loadWorkforceStatus } from '../../workforce/public-workforce-grid.js';
import { loadContractorStatus } from '../../contractors/global-contractor-marketplace.js';
import { getRegionStatus } from '../../topology/global-topology-utils.js';

export function routeRequest(request) {
  const { sector, workflow, priority, location } = request;

  const sectorMap = {
    infrastructure: 'infra-engine',
    energy: 'energy-engine',
    water: 'water-engine',
    transport: 'transport-engine',
    public: 'public-services-engine',
    gov: 'gov-ops-engine'
  };

  const baseEngine = sectorMap[sector] || 'infra-engine';

  const regionStatus = getRegionStatus(location);
  const disasterMode = regionStatus?.disaster === true;
  const warZoneMode = regionStatus?.warZone === true;

  const workforce = loadWorkforceStatus(location);
  const contractors = loadContractorStatus(location);

  return {
    engine: baseEngine,
    worker: resolveWorker(sector, location, disasterMode, warZoneMode),
    priority: resolvePriority(priority, disasterMode, warZoneMode),
    flags: {
      disasterMode,
      warZoneMode
    },
    workforce,
    contractors
  };
}

function resolveWorker(sector, location, disasterMode, warZoneMode) {
  if (warZoneMode) return `${sector}-war-worker`;
  if (disasterMode) return `${sector}-disaster-worker`;
  return `${sector}-standard-worker-${location.region || 'default'}`;
}

function resolvePriority(priority, disasterMode, warZoneMode) {
  if (warZoneMode) return 'critical';
  if (disasterMode && priority !== 'critical') return 'high';
  return priority || 'normal';
}
