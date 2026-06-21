// © 2026 Global Infrastructure Advisory
// Generic Mission Actions

import { MissionAction } from "./action";

export const GenericActions: MissionAction[] = [
  {
    id: "REFRESH",
    label: "Refresh",
    icon: "refresh",
    async execute(stack, ctx) {
      return { ok: true, timestamp: Date.now() };
    }
  }
];
