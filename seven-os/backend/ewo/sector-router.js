// backend/system/ewo/sector-router.js
// GISA Multi‑Sector Unified Router (v3)
// Routes EWO to the correct sector worker with AI‑expandable support

import { logEvent } from "../../system/logging/system-log.js";

// Main router
export async function routeToSectorWorker(ewo) {
  const sector = (ewo.sector || "").toLowerCase();

  // Log routing attempt
  await logEvent({
    type: "EWO_ROUTING",
    ewo_id: ewo.ewo_id,
    sector,
    region: ewo.region
  });

  // Sector routing map (AI can expand this)
  const routingTable = {
    telecom: dispatchToTelecom,
    power: dispatchToPower,
    water: dispatchToWater,
    farmer: dispatchToFarmer,
    agriculture: dispatchToFarmer,
    logistics: dispatchToLogistics,
    datacenter: dispatchToDatacenter
  };

  // If sector exists → route it
  if (routingTable[sector]) {
    return await routingTable[sector](ewo);
  }

  // If sector is unknown → auto‑register + generic dispatch
  return await dispatchToGeneric(ewo);
}

/* -----------------------------
   SECTOR DISPATCH FUNCTIONS
   (Wire these to real workers later)
--------------------------------*/

async function dispatchToTelecom(ewo) {
  return {
    sector: "telecom",
    worker: "telecom-worker",
    status: "QUEUED",
    message: "Telecom EWO routed to NOC / tower / fiber worker."
  };
}

async function dispatchToPower(ewo) {
  return {
    sector: "power",
    worker: "power-worker",
    status: "QUEUED",
    message: "Power EWO routed to grid / substation worker."
  };
}

async function dispatchToWater(ewo) {
  return {
    sector: "water",
    worker: "water-worker",
    status: "QUEUED",
    message: "Water EWO routed to pump / treatment worker."
  };
}

async function dispatchToFarmer(ewo) {
  return {
    sector: "farmer",
    worker: "farmer-worker",
    status: "QUEUED",
    message: "Agriculture EWO routed to farm / rural support worker."
  };
}

async function dispatchToLogistics(ewo) {
  return {
    sector: "logistics",
    worker: "logistics-worker",
    status: "QUEUED",
    message: "Logistics EWO routed to transport / supply chain worker."
  };
}

async function dispatchToDatacenter(ewo) {
  return {
    sector: "datacenter",
    worker: "datacenter-worker",
    status: "QUEUED",
    message: "Datacenter EWO routed to facility / cooling / network worker."
  };
}

/* -----------------------------
   GENERIC FALLBACK (AI‑EXPANDABLE)
--------------------------------*/

async function dispatchToGeneric(ewo) {
  return {
    sector: ewo.sector || "unknown",
    worker: "generic-worker",
    status: "QUEUED_GENERIC",
    message: "Unknown sector — routed to generic handler. AI may create new sector."
  };
}