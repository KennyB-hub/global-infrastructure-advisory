// /ai-engine/ai-utilities.js
// GIA Sovereign Utility Engine – V12 Alpha

import { validatePayload } from "../ai/validation/validator.js";
import { sanitizeOutput } from "./response-sanitizer.js";
import { handleError } from "./error-handler.js";
import { buildContext } from "./context-builder.js";

export async function runUtilityTask(input = {}, env = {}) {
  //
  // 1. Validate input schema
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
  // 3. Execute utility logic
  //
  let result;
  try {
    result = await executeUtility(input.text);
  } catch (err) {
    return handleError(err, env, { utility: true, input });
  }

  //
  // 4. Sanitize output
  //
  const sanitized = await sanitizeOutput(
    {
      type: "utility",
      content: result,
      meta: { input: input.text }
    },
    env,
    context
  );

  //
  // 5. Return sovereign‑grade utility output
  //
  return sanitized;
}

//
// --- INTERNAL UTILITY ENGINE ------------------------------------------------
//

async function executeUtility(text) {
  const t = text.trim().toLowerCase();

  // Example V12 baseline utilities
  if (t.startsWith("uppercase ")) {
    return text.replace(/^uppercase\s+/i, "").toUpperCase();
  }

  if (t.startsWith("lowercase ")) {
    return text.replace(/^lowercase\s+/i, "").toLowerCase();
  }

  if (t.startsWith("reverse ")) {
    return text.replace(/^reverse\s+/i, "").split("").reverse().join("");
  }

  if (t.startsWith("trim ")) {
    return text.replace(/^trim\s+/i, "").trim();
  }

  // Default fallback
  return `Utility engine processed: ${text}`;
}
