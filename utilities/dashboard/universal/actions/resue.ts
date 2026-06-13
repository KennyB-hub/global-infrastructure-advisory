// © 2026 Global Infrastructure Advisory
// Rescue / Emergency Mission Actions

import { MissionAction } from "./action";

export const RescueActions: MissionAction[] = [
  {
    id: "DISPATCH_RESCUE",
    label: "Dispatch Rescue Unit",
    icon: "emergency",
    async execute(stack, ctx) {
      return stack.rescue.dispatch(ctx.unitId, ctx.payload);
    }
  },
  {
    id: "MARK_VICTIM",
    label: "Mark Victim",
    icon: "person_pin",
    async execute(stack, ctx) {
      return stack.rescue.markVictim(ctx.payload);
    }
  },
  {
    id: "REQUEST_MEDICAL",
    label: "Request Medical",
    icon: "medical_services",
    async execute(stack, ctx) {
      return stack.rescue.requestMedical(ctx.payload);
    }
  }
];
