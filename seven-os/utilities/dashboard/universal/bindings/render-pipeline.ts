// © 2026 Global Infrastructure Advisory
// Pipeline Data Bindings

import { DataBinding } from "./binding";

export const PipelineBindings: DataBinding[] = [
  {
    key: "pipelineSegments",
    resolve: (stack) => stack.runtime.pipeline?.getSegments() || []
  },
  {
    key: "pressureStatus",
    resolve: (stack) => stack.runtime.pipeline?.getPressureStatus() || {
      title: "Pressure",
      value: "Unknown",
      status: "unknown"
    }
  },
  {
    key: "leakStatus",
    resolve: (stack) => stack.runtime.pipeline?.getLeakStatus() || {
      title: "Leak",
      value: "None",
      status: "normal"
    }
  }
];
