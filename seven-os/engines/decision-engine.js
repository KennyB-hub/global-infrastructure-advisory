// seven-os/backend/ai/decision-engine.js
// GIA Sovereign Decision Engine – V12 Alpha

import { validatePayload, validateTrustZone } from "./core/validator.ts";
import { makeOk, makeError } from "../../ai/ai-context.js";

import workflows from "./workflows/index.js";
import policies from "./policies/index.js";
import { runDecisionEngine } from "../../backend/ai/decision-engine.js";
import { CryptoV12 } from "../ai-engines/utils/crypto.js"; // ← NEW

export async function runDecisionEngine(input, env) {
  //
  // 1. Validate input schema
  //
  const schemaCheck = await validatePayload(env, input, {
    trustZone: { required: true, type: "string" },
    workflow: { required: true, type: "string" },
    data: { required: true, type: "object" }
  });
  if (!schemaCheck.ok) return schemaCheck;

  //
  // 2. Validate trust zone
  //
  const trustCheck = await validateTrustZone(env, input.trustZone, 1);
  if (!trustCheck.ok) return trustCheck;

  //
  // 3. Apply policy
  //
  const policy = policies[input.trustZone];
  if (!policy) return makeError("No policy for trust zone", env, { zone: input.trustZone });

  const policyCheck = policy.validate(input);
  if (!policyCheck.valid) {
    return makeError("Policy violation", env, { errors: policyCheck.errors });
  }

  //
  // 4. Validate workflow exists
  //
  const workflow = workflows[input.workflow];
  if (!workflow) {
    return makeError("Workflow not found", env, { workflow: input.workflow });
  }

  //
  // 5. Validate workflow input schema (if defined)
  //
  if (workflow.schema?.input) {
    const wfInputCheck = await validatePayload(env, input.data, workflow.schema.input);
    if (!wfInputCheck.ok) return wfInputCheck;
  }

  //
  // 6. Execute workflow
  //
  let result;
  try {
    result = await workflow.run(input.data, env);
  } catch (err) {
    return makeError("Workflow execution failed", env, { message: err.message });
  }

  //
  // 7. Validate workflow output schema (if defined)
  //
  if (workflow.schema?.output) {
    const wfOutputCheck = await validatePayload(env, result, workflow.schema.output);
    if (!wfOutputCheck.ok) return wfOutputCheck;
  }

  //
  // 8. Return sovereign‑grade response
  //
  return makeOk({ workflow: input.workflow, result }, env);
}
