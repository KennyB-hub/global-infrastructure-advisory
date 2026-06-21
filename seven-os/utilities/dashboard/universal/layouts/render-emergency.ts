// © 2026 Global Infrastructure Advisory
// Emergency / Rescue Sector Layouts

import { DashboardLayout } from "./layout";

export const RESCUE_DRONE_LAYOUT: DashboardLayout = {
  id: "RESCUE_DRONE_LAYOUT",
  regions: {
    main: ["MAP_DRONE", "FEED_VIDEO"],
    side: ["CARD_VICTIM_STATUS", "CARD_MISSION_STATUS"],
    footer: ["CARD_LINK_STATUS"]
  }
};

export const RESCUE_ROVER_LAYOUT: DashboardLayout = {
  id: "RESCUE_ROVER_LAYOUT",
  regions: {
    main: ["MAP_ROVER", "FEED_VIDEO"],
    side: ["CARD_TERRAIN_STATUS"],
    footer: ["CARD_SYNC_STATUS"]
  }
};

export const EMT_LAYOUT: DashboardLayout = {
  id: "EMT_LAYOUT",
  regions: {
    main: ["MAP_INCIDENT", "LIST_PATIENTS"],
    side: ["CARD_TRIAGE_STATUS"],
    footer: ["CARD_NETWORK_STATUS"]
  }
};
