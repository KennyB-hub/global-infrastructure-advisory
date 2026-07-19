// 2050 V12 Alpha — AI Worker

import { routeAI } from "../route/ai-router.js";
import { filterAIInput } from "../ai/filters/ai-filter.js";
import { sanitizeAIOutput } from "./ai-sanitizer.js";
import { enforceAIPolicy } from "../ai/policy/index.js";
import { rememberShortTerm } from "../ai/ai-memory.js";
import { checkAISafety } from "./ai-safety.js";
import { logAIEvent } from "./ai-logs.js";
import { recordAITelemetry } from "./ai-telemetry.js";

export async function runAITask({ task, context }) {
  // 1. Policy
  const policy = enforceAIPolicy({
    trustZone: context.trustZone,
    workflow: context.workflow
  });
  if (!policy.allowed) {
    const error = { ok: false, code: "AI_POLICY_BLOCKED" };
    logAIEvent({ type: "policy-block", task, result: error });
    return error;
  }

  // 2. Input filter (for text-based tasks)
  if (task.inputText) {
    const filter = filterAIInput(task.inputText);
    if (!filter.allowed) {
      const error = { ok: false, code: filter.reason };
      logAIEvent({ type: "input-block", task, result: error });
      return error;
    }
  }

  // 3. Route to correct AI organ
  const result = await routeAI(task);

  // 4. Safety + sanitize (for text outputs)
  if (result?.result) {
    const safety = checkAISafety(result.result);
    if (!safety.safe) {
      const error = { ok: false, code: safety.reason };
      logAIEvent({ type: "safety-block", task, result: error });
      return error;
    }

    result.result = sanitizeAIOutput(result.result);
  }

  // 5. Memory (short-term)
  rememberShortTerm(context.ai?.contextId, {
    task,
    result
  });

  // 6. Telemetry + logs
  recordAITelemetry({ context, task, result });
  logAIEvent({ type: "task-complete", task, result });

  return result;
}
