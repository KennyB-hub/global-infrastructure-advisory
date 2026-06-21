// © 2026 Global Infrastructure Advisory
// Pipeline Sector Layouts

import { DashboardLayout } from "./layout";

export const PIPELINE_SCAN_LAYOUT: DashboardLayout = {
  id: "PIPELINE_SCAN_LAYOUT",
  regions: {
    main: ["MAP_PIPELINE", "FEED_VIDEO"],
    side: ["CARD_PRESSURE_STATUS"],
    footer: ["CARD_NETWORK_STATUS"]
  }
};

export const PIPELINE_LEAK_LAYOUT: DashboardLayout = {
  id: "PIPELINE_LEAK_LAYOUT",
  regions: {
    main: ["MAP_LEAK", "LIST_SENSORS"],
    side: ["CARD_LEAK_STATUS"],
    footer: ["CARD_SYNC_STATUS"]
  }
};
