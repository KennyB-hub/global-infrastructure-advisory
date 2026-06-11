// © 2026 Global Infrastructure Advisory
// Drone / Air Mission Actions

import { MissionAction } from "./action";

export const DroneActions: MissionAction[] = [
  {
    id: "LAUNCH_DRONE",
    label: "Launch Drone",
    icon: "flight_takeoff",
    async execute(stack, ctx) {
      return stack.runtime.air?.launch(ctx.unitId);
    }
  },
  {
    id: "START_SCAN",
    label: "Start Scan",
    icon: "radar",
    async execute(stack, ctx) {
      return stack.runtime.air?.startScan(ctx.unitId, ctx.payload);
    }
  },
  {
    id: "RETURN_HOME",
    label: "Return Home",
    icon: "home",
    async execute(stack, ctx) {
      return stack.runtime.air?.returnHome(ctx.unitId);
    }
  }
];
