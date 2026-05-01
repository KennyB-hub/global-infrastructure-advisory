// backend/ai-engine/ai-router.js

import { basicSecurityGuard } from "../backend/security/worker-guard.js";
import { matchIntent } from "./ai-matching.js"
import { runGeoTask } from "./ai-geo.js"
import { runUtilityTask } from "./ai-utilities.js"
import { runDecisionEngine } from "./decision-engine.js"
import { runSandboxAI } from "./sandbox-bridge.js"

export async function processAIRequest(input, env) {
  const trustZone = enforceTrustZone(input);
  // attach to context, log, etc.
}
  switch (intent) {
    case "geo":
      return runGeoTask(input, context)

    case "utility":
      return runUtilityTask(input, context)
    
    case "sandbox":
    return runSandboxAI(input, context.env)

    case "decision":
      return runDecisionEngine(input, context)

    default:
      return {
        status: "unknown_intent",
        message: "The AI engine could not classify this request."
      }
  }
