// /ai-engine/sandbox-bridge.js
// GIA Sovereign Sandbox Bridge – V12 Alpha (ESM Safe)

export async function runSandboxAI(input = {}, env = {}) {
  // Load dependencies dynamically (ESM + CJS compatible)
  const { validatePayload } = await import("../utils/validator.js");
  const { buildContext } = await import("./context-builder.js");
  const { sanitizeOutput } = await import("./response-sanitizer.js");
  const { handleError } = await import("./error-handler.js");

  // Load AI engine (supports both ESM and CJS)
  const SandboxAI = await import("../../seven-os/ai/ai-engine.js")
    .then(m => m.AI || m.default);

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
  // 4. Sanitize output
  //
  const sanitized = await sanitizeOutput(result, env, context);

  //
  // 5. Return sovereign‑grade sandbox output
  //
  return sanitized;
}
