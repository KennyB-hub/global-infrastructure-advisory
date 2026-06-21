// © 2026 Global Infrastructure Advisory
// Generic / Fallback Layouts

import { DashboardLayout } from "./layout";

export const GENERIC_STATUS_LAYOUT: DashboardLayout = {
  id: "GENERIC_STATUS_LAYOUT",
  regions: {
    main: ["CARD_SYSTEM_STATUS"],
    side: ["LIST_EVENTS"],
    footer: ["CARD_NETWORK_STATUS"]
  }
};
