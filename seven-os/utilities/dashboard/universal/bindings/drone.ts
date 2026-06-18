// © 2026 Global Infrastructure Advisory
// Drone / Air Data Bindings

import { DataBinding } from "./binding";

export const DroneBindings: DataBinding[] = [
  {
    key: "dronePosition",
    resolve: (stack) => stack.runtime.air?.getDronePosition() || null
  },
  {
    key: "droneVideo",
    resolve: (stack) => stack.runtime.air?.getVideoFeed() || {
      streamUrl: null,
      metadata: {}
    }
  },
  {
    key: "missionStatus",
    resolve: (stack) => stack.runtime.air?.getMissionStatus() || {
      title: "Mission",
      value: "Idle",
      status: "idle"
    }
  },
  {
    key: "linkStatus",
    resolve: (stack) => stack.runtime.air?.getLinkStatus() || {
      title: "Link",
      value: "Unknown",
      status: "unknown"
    }
  }
];
