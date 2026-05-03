// src/ai-engine/ai-router.js

import { basicSecurityGuard } from "../src/security/worker-guard.js";
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

    if (url.pathname === "/system/uptime" && request.method === "GET") {
    return new Response(JSON.stringify({
        uptimeMs: Date.now() - START_TIME,
        coldStart: START_TIME,
        timestamp: Date.now()
    }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}

