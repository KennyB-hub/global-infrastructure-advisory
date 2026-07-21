// /ai-engine/sandbox-bridge.js
// GIA Sovereign Sandbox Bridge – V12 Alpha

import { validatePayload } from "../ai/validation/validator.js";
import { buildContext } from "./context-builder.js";
import { sanitizeOutput } from "./response-sanitizer.js";
import { handleError } from "./error-handler.js";

import { AI as SandboxAI } from "../../src/ai/ai-engine.js";

export async function runSandboxAI(input = {}, env = {}) {
  //
  // 1. Validate sandbox input (light schema)
  //
  const schemaCheck = await validatePayload(env, input, {
    text: { required: true, type: "string" },
    trustZone: { required: false, type: "string" },
    workflow: { required: false, type: "string" }
  });

  if (!schemaCheck.ok) return schemaCheck;

  //
  // 2. Build sovereign execution context
  //
  const context = await buildContext(input, env);

  //
  // 3. Run sandbox AI engine
  //
  let result;
  try {
    result = await SandboxAI.run({ ...input, context }, env);
  } catch (err) {
    return handleError(err, env, { sandbox: true, input });
  }

  //
  // 4. Sanitize output (so sandbox cannot leak unsafe data)
  //
  const sanitized = await sanitizeOutput(result, env, context);

  //
  // 5. Return sovereign‑grade sandbox output
  //
  return sanitized;
}
