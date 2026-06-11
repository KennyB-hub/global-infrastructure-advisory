// © 2026 Global Infrastructure Advisory
// Generic / System Data Bindings

import { DataBinding } from "./binding";

export const GenericBindings: DataBinding[] = [
  {
    key: "systemStatus",
    resolve: (stack) => stack.runtime.getSystemStatus()
  },
  {
    key: "recentEvents",
    resolve: (stack) => stack.eventQueue.getRecent()
  },
  {
    key: "networkStatus",
    resolve: (stack) => stack.connectionMonitor.getStatus()
  }
];
