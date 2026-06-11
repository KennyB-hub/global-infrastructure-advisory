// © 2026 Global Infrastructure Advisory
// Air / Drone Sector Layouts

import { DashboardLayout } from "./layout";

export const DRONE_SCAN_LAYOUT: DashboardLayout = {
  id: "DRONE_SCAN_LAYOUT",
  regions: {
    main: ["MAP_DRONE", "FEED_VIDEO"],
    side: ["CARD_MISSION_STATUS"],
    footer: ["CARD_LINK_STATUS"]
  }
};

export const DRONE_PATROL_LAYOUT: DashboardLayout = {
  id: "DRONE_PATROL_LAYOUT",
  regions: {
    main: ["MAP_DRONE", "LIST_PATROL_POINTS"],
    side: ["CARD_BATTERY", "CARD_SIGNAL"],
    footer: ["CARD_SYNC_STATUS"]
  }
};

export const DRONE_INSPECTION_LAYOUT: DashboardLayout = {
  id: "DRONE_INSPECTION_LAYOUT",
  regions: {
    main: ["MAP_DRONE", "FEED_VIDEO"],
    side: ["CARD_INSPECTION_STATUS"],
    footer: ["CARD_NETWORK_STATUS"]
  }
};
