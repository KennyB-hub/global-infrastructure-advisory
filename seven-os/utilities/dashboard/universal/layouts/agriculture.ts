// © 2026 Global Infrastructure Advisory
// Agriculture Sector Layouts

import { DashboardLayout } from "./layout";

export const CATTLE_LOCATE_LAYOUT: DashboardLayout = {
  id: "CATTLE_LOCATE_LAYOUT",
  regions: {
    main: ["MAP_CATTLE", "LIST_CATTLE"],
    side: ["CARD_PASTURE_STATUS"],
    footer: ["CARD_SYNC_STATUS"]
  }
};

export const CATTLE_LOAD_LAYOUT: DashboardLayout = {
  id: "CATTLE_LOAD_LAYOUT",
  regions: {
    main: ["MAP_TRAILER", "CARD_LOAD_BALANCE"],
    side: ["LIST_CATTLE"],
    footer: ["CARD_TRAILER_STATUS"]
  }
};

export const CATTLE_HAUL_LAYOUT: DashboardLayout = {
  id: "CATTLE_HAUL_LAYOUT",
  regions: {
    main: ["MAP_ROUTE", "CARD_ETA"],
    side: ["CARD_WELFARE_STATUS"],
    footer: ["CARD_SYNC_STATUS"]
  }
};
