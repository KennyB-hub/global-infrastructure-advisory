// system/disaster/seven-rescue-supply.js

import { SEVERITY } from "./disaster-grid.js";

// ---------------------------------------------
// Core Rescue & Supply Protocol
// ---------------------------------------------
export function buildRescueAndSupplyPlan({ disaster, severity, zone, resources = {} }) {
  const rescuePlan = buildRescuePlan(disaster, severity, zone, resources);
  const supplyPlan = buildSupplyPlan(disaster, severity, zone, resources);

  return {
    rescuePlan,
    supplyPlan,
    spokenText: buildSpokenSummary(rescuePlan, supplyPlan),
    displayText: buildDisplaySummary(rescuePlan, supplyPlan),
    actions: [
      { type: "SHOW_RESCUE_PLAN", plan: rescuePlan },
      { type: "SHOW_SUPPLY_PLAN", plan: supplyPlan }
    ]
  };
}

// ---------------------------------------------
// Rescue Plan
// ---------------------------------------------
function buildRescuePlan(disaster, severity, zone, resources) {
  const teams = resources.teams || [];
  const drones = resources.drones || [];
  const vehicles = resources.vehicles || [];

  const primaryDirection = "north"; // placeholder – later tie to terrain/grid

  return {
    disaster,
    severity,
    zone,
    primaryDirection,
    assignments: {
      teams: assignTeams(teams, disaster, severity, zone),
      drones: assignDrones(drones, disaster, severity, zone),
      vehicles: assignVehicles(vehicles, disaster, severity, zone)
    }
  };
}

function assignTeams(teams, disaster, severity, zone) {
  return teams.map(team => ({
    id: team.id,
    role: team.role,
    task: pickTeamTask(team, disaster, severity),
    targetZone: zone
  }));
}

function pickTeamTask(team, disaster, severity) {
  if (team.role === "emt") return "triage_and_stabilize";
  if (team.role === "rescue") return "locate_and_extract";
  if (team.role === "fire" && disaster === "fire") return "contain_and_defend";
  if (severity === SEVERITY.CRITICAL) return "evacuate";
  return "standby_support";
}

function assignDrones(drones, disaster, severity, zone) {
  return drones.map(drone => ({
    id: drone.id,
    payload: drone.payload || "camera",
    task: pickDroneTask(drone, disaster, severity),
    targetZone: zone
  }));
}

function pickDroneTask(drone, disaster, severity) {
  if (drone.payload === "thermal") return "thermal_search";
  if (drone.payload === "supply") return "supply_drop";
  if (severity === SEVERITY.CRITICAL) return "overwatch";
  return "recon";
}

function assignVehicles(vehicles, disaster, severity, zone) {
  return vehicles.map(vehicle => ({
    id: vehicle.id,
    type: vehicle.type,
    task: pickVehicleTask(vehicle, disaster, severity),
    targetZone: zone
  }));
}

function pickVehicleTask(vehicle, disaster, severity) {
  if (vehicle.type === "ambulance") return "transport_critical";
  if (vehicle.type === "truck" && disaster === "flood") return "high_clearance_transport";
  if (severity === SEVERITY.CRITICAL) return "mass_evac";
  return "logistics_support";
}

// ---------------------------------------------
// Supply Plan
// ---------------------------------------------
function buildSupplyPlan(disaster, severity, zone, resources) {
  const stock = resources.stock || [];
  const depots = resources.depots || [];

  return {
    disaster,
    severity,
    zone,
    supplyLines: buildSupplyLines(stock, depots, zone, severity)
  };
}

function buildSupplyLines(stock, depots, zone, severity) {
  return depots.map(depot => ({
    depotId: depot.id,
    priority: severityToSupplyPriority(severity),
    items: pickSupplyItems(stock, depot, severity),
    route: {
      from: depot.location,
      to: zone,
      mode: "ground" // later: ground/air/water
    }
  }));
}

function severityToSupplyPriority(severity) {
  if (severity === SEVERITY.CRITICAL) return "immediate";
  if (severity === SEVERITY.HIGH) return "high";
  if (severity === SEVERITY.MODERATE) return "normal";
  return "low";
}

function pickSupplyItems(stock, depot, severity) {
  // naive for now – later tie to disaster type + medical needs
  return stock
    .filter(item => item.depotId === depot.id)
    .map(item => ({
      id: item.id,
      type: item.type,
      quantity: severity === SEVERITY.CRITICAL ? item.maxBurst || item.quantity : item.quantity
    }));
}

// ---------------------------------------------
// Summaries
// ---------------------------------------------
function buildSpokenSummary(rescuePlan, supplyPlan) {
  return `Rescue and supply plans generated. Rescue teams assigned, drones tasked, and supply lines established.`;
}

function buildDisplaySummary(rescuePlan, supplyPlan) {
  return `> SEVEN: Rescue and supply protocols active. Teams, drones, and supply lines are now assigned to the disaster grid.`;
}
