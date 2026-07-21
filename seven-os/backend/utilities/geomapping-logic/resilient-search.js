/**
 * © 2026 Global Infrastructure Advisory
 * Resilient Search Engine — Heartbeat + Failover + Triage
 */

import { checkSystemPulse } from "./system-heartbeat.js";
import { runEmergencyMatch } from "../geo/emergency-failover.js";
import { applyTriage } from "../geo/priority-triage.js";
import { findNearbyProjects } from "./project-search.js";

export const runResilientProjectSearch = async (lat, lon, primaryEndpoint) => {
  const status = await checkSystemPulse(primaryEndpoint);

  const isEmergency = status === "OFFLINE";

  // 1. Base search
  const matches = findNearbyProjects(lat, lon);

  // 2. Emergency failover logic
  const failoverMatches = runEmergencyMatch(lat, lon, status);

  // 3. Apply triage rules
  const triaged = applyTriage(failoverMatches, isEmergency);

  return {
    system_status: status,
    emergency_mode: isEmergency,
    results: triaged
  };
};
