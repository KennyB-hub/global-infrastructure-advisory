// © 2026 Global Infrastructure Advisory
// Cattle / Agriculture Mission Actions

import { MissionAction } from "./action";

export const CattleActions: MissionAction[] = [
  {
    id: "SYNC_COLLARS",
    label: "Sync Collars",
    icon: "refresh",
    async execute(stack, ctx) {
      return stack.runtime.cattle?.syncAll();
    }
  },
  {
    id: "MARK_PASTURE",
    label: "Mark Pasture",
    icon: "flag",
    async execute(stack, ctx) {
      return stack.runtime.cattle?.markPasture(ctx.payload?.boundary);
    }
  },
  {
    id: "CALL_HERD",
    label: "Call Herd",
    icon: "bell",
    async execute(stack, ctx) {
      return stack.runtime.cattle?.broadcastTone("herd-call");
    }
  }
];
