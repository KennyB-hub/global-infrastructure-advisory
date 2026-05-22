// cattle/rotation-engine.ts
import { publishEvent } from "../event-bus";

export interface PasturePlan {
  pastureId: string;
  restDays: number;
  grazingDays: number;
  lastGrazed: number;
}

export function evaluateRotation(herdState, pasturePlans: PasturePlan[]) {
  const now = Date.now();

  for (const plan of pasturePlans) {
    const daysSinceGrazed = (now - plan.lastGrazed) / (1000 * 60 * 60 * 24);

    if (daysSinceGrazed >= plan.restDays) {
      publishEvent("ROTATION_READY", { pastureId: plan.pastureId });
    }

    if (daysSinceGrazed >= plan.grazingDays) {
      publishEvent("ROTATION_DUE", { pastureId: plan.pastureId });
    }
  }
}
