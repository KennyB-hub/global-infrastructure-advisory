// © 2026 Global Infrastructure Advisory
// Agriculture / Cattle Data Bindings

import { DataBinding } from "./binding";

export const CattleBindings: DataBinding[] = [
  {
    key: "cattleLocations",
    resolve: (stack) => stack.runtime.cattle?.getLocations() || []
  },
  {
    key: "cattleList",
    resolve: (stack) => stack.runtime.cattle?.getList() || []
  },
  {
    key: "pastureStatus",
    resolve: (stack) => stack.runtime.cattle?.getPastureStatus() || {
      title: "Pasture Status",
      value: "Unknown",
      status: "unknown"
    }
  },
  {
    key: "collarSyncStatus",
    resolve: (stack) => stack.runtime.cattle?.getSyncStatus() || {
      title: "Collar Sync",
      value: "No Data",
      status: "offline"
    }
  }
];
