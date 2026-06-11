// © 2026 Global Infrastructure Advisory
// Utilities Sector Layouts (Grid, Water, Telecom)

import { DashboardLayout } from "./layout";

export const GRID_INSPECTION_LAYOUT: DashboardLayout = {
  id: "GRID_INSPECTION_LAYOUT",
  regions: {
    main: ["MAP_GRID", "GRAPH_LOAD"],
    side: ["CARD_OUTAGE_STATUS"],
    footer: ["CARD_NETWORK_STATUS"]
  }
};

export const WATER_SYSTEM_LAYOUT: DashboardLayout = {
  id: "WATER_SYSTEM_LAYOUT",
  regions: {
    main: ["MAP_WATER", "GRAPH_PRESSURE"],
    side: ["CARD_PUMP_STATUS"],
    footer: ["CARD_SYNC_STATUS"]
  }
};

export const TELECOM_TOWER_LAYOUT: DashboardLayout = {
  id: "TELECOM_TOWER_LAYOUT",
  regions: {
    main: ["MAP_TOWERS", "GRAPH_SIGNAL"],
    side: ["CARD_TOWER_STATUS"],
    footer: ["CARD_NETWORK_STATUS"]
  }
};
