// © 2026 Global Infrastructure Advisory
// Pipeline Mission Actions

import { MissionAction } from "./action";

export const PipelineActions: MissionAction[] = [
  {
    id: "SCAN_PIPELINE",
    label: "Scan Pipeline",
    icon: "search",
    async execute(stack, ctx) {
      return stack.runtime.pipeline?.scan(ctx.unitId);
    }
  },
  {
    id: "SHUTDOWN_SEGMENT",
    label: "Shutdown Segment",
    icon: "block",
    async execute(stack, ctx) {
      return stack.runtime.pipeline?.shutdown(ctx.payload?.segmentId);
    }
  }
];
