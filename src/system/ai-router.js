// 2050 V12 Alpha — AI Router
// Routes AI tasks to the correct organ

import { runMatchingEngine } from "./ai-matching.js";
import { runDecisionEngine } from "./ai-decision.js";
import { runDeepMind } from "./ai-cortex.js";

export function routeAI(task) {
  switch (task.type) {
    case "match":
      return runMatchingEngine(task);
    case "decision":
      return runDecisionEngine(task);
    case "deep-mind":
      return runDeepMind(task);
    default:
      return {
        ok: false,
        error: "UNKNOWN_AI_TASK",
        task
      };
  }
}
