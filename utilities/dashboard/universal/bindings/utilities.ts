// © 2026 Global Infrastructure Advisory
// Grid / Utilities Data Bindings

import { DataBinding } from "./binding";

export const UtilityBindings: DataBinding[] = [
  {
    key: "gridNodes",
    resolve: (stack) => stack.runtime.grid?.getNodes() || []
  },
  {
    key: "gridLoad",
    resolve: (stack) => stack.runtime.grid?.getLoadGraph() || {
      points: [],
      labels: []
    }
  },
  {
    key: "outageStatus",
    resolve: (stack) => stack.runtime.grid?.getOutageStatus() || {
      title: "Outages",
      value: "Unknown",
      status: "unknown"
    }
  },
  {
    key: "networkStatus",
    resolve: (stack) => stack.connectionMonitor.getStatus()
  }
];
