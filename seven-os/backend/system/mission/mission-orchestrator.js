// system/mission/mission-orchestrator.js

import { analyzeDisasterGrid } from "../disaster/disaster-grid.js";
import { buildRescueAndSupplyPlan } from "../disaster/seven-rescue-supply.js";
import { selectVoiceMode } from "../../routes/selectVoiceMode.js";

// ---------------------------------------------
// Mission Orchestration Entry Point
// ---------------------------------------------
export function orchestrateMission({ text, role, sessionId, sensors, resources }) {
  // 1. Analyze disaster grid
  const grid = analyzeDisasterGrid({ text, sensors, role });

  // 2. Build rescue & supply plan
  const plans = buildRescueAndSupplyPlan({
    disaster: grid.detected,
    severity: grid.severity,
    zone: grid.zone,
    resources
  });

  // 3. Merge into a single mission object
  const mission = buildMissionObject({ grid, plans, role, sessionId });

  return mission;
}

// ---------------------------------------------
// Mission Object Builder
// ---------------------------------------------
function buildMissionObject({ grid, plans, role, sessionId }) {
  return {
    sessionId,
    role,
    disaster: grid.detected,
    severity: grid.severity,
    priority: grid.priority,
    mode: grid.mode,
    zone: grid.zone,
    routing: grid.routing,
    rescuePlan: plans.rescuePlan,
    supplyPlan: plans.supplyPlan,
    spokenText: buildSpokenMission(grid, plans),
    displayText: buildDisplayMission(grid, plans),
    actions: [
      ...grid.actions,
      ...plans.actions,
      {
        type: "MISSION_SUMMARY",
        payload: {
          disaster: grid.detected,
          severity: grid.severity,
          zone: grid.zone
        }
      }
    ]
  };
}

// ---------------------------------------------
// Mission Narratives
// ---------------------------------------------
function buildSpokenMission(grid, plans) {
  return `Mission generated. ${grid.spokenText} Rescue and supply protocols are active.`;
}

function buildDisplayMission(grid, plans) {
  return `> SEVEN: Mission orchestration complete.\n${grid.displayText}\n> Rescue and supply plans deployed.`;
}
