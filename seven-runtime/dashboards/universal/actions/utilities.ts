// © 2026 Global Infrastructure Advisory
// Grid / Utilities Mission Actions

import { MissionAction } from "./action";

export const UtilityActions: MissionAction[] = [
  {
    id: "ISOLATE_GRID_NODE",
    label: "Isolate Node",
    icon: "power_off",
    async execute(stack, ctx) {
      return stack.runtime.grid?.isolateNode(ctx.payload?.nodeId);
    }
  },
  {
    id: "RESET_BREAKER",
    label: "Reset Breaker",
    icon: "restart_alt",
    async execute(stack, ctx) {
      return stack.runtime.grid?.resetBreaker(ctx.payload?.breakerId);
    }
  }
];
