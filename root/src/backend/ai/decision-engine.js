// src/backend/ai/decision-engine.js
// GIA Sovereign Decision Engine – V12 Sovereign Edition

import workflows from "./workflows/index.js";
import policies from "./policies/index.js";
import { validatePayload, validateTrustZone } from "../utils/validator.js";
import { makeOk, makeError } from "../utils/context.js";

export async function runDecisionEngine(input, env, nodeRegistry = {}) {
  //
  // 1. Validate base schema
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
  // 3. Apply policy for trust zone
  //
  const policy = policies[input.trustZone];
  if (!policy) {
    return makeError("No policy for trust zone", env, { zone: input.trustZone });
  }

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
  // 5. Sovereign Context (identity, threat, mcp, cluster)
  //
  const identity = input.identity || {};
  const threat = input.threat || { level: "none" };
  const mcp = input.mcp || { allowed: true, policy: "default" };

  // Select cluster based on trust zone
  const cluster = (nodeRegistry.clusters || []).find(
    c => c.trustZone === input.trustZone
  ) || null;

  //
  // 6. Validate workflow input schema (if defined)
  //
  if (workflow.schema?.input) {
    const wfInputCheck = await validatePayload(env, input.data, workflow.schema.input);
    if (!wfInputCheck.ok) return wfInputCheck;
  }

  //
  // 7. Execute workflow with full sovereign context
  //
  let result;
  try {
    result = await workflow.run(
      {
        data: input.data,
        identity,
        trustZone: input.trustZone,
        threat,
        mcp,
        cluster,
        nodeRegistry
      },
      env
    );
  } catch (err) {
    return makeError("Workflow execution failed", env, { message: err.message });
  }

  //
  // 8. Validate workflow output schema (if defined)
  //
  if (workflow.schema?.output) {
    const wfOutputCheck = await validatePayload(env, result, workflow.schema.output);
    if (!wfOutputCheck.ok) return wfOutputCheck;
  }

  //
  // 9. Return sovereign‑grade response
  //
  return makeOk(
    {
      workflow: input.workflow,
      result,
      identity,
      trustZone: input.trustZone,
      threat,
      mcp,
      cluster
    },
    env
  );
}
