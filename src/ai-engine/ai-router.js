// 2050 V12 Alpha — AI Router
// Routes AI tasks to the correct organ

import { runMatchingEngine } from "./ai-matching.js";
import { runDecisionEngine } from "./ai-decision.js";
import { runDeepMind } from "./ai-cortex.js";
import { runAIM } from "./ai-aim.js";
import { runCyberEngine } from "./ai-cyber.js";

export function routeAI(task, env) {
  switch (task.type) {
    case "aim":
      return runAIM(task, env);
      
    case "cyber":
      return runCyberEngine(task, env);

    case "match":
      return runMatchingEngine(task, env);

    case "decision":
      return runDecisionEngine(task, env);

    case "deep-mind":
      return runDeepMind(task, env);

    default:
      return { ok: false, error: "UNKNOWN_AI_TASK" };
  }
}