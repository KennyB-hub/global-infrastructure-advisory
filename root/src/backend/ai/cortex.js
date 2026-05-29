// backend/ai/cortex.js
// GIA Cortex v12 — Sovereign Reasoning Engine

import { SchemaGuard } from "./schema-guard.js";
import { Tools } from "./tools.js";
import { Workflows } from "./workflows.js";
import { Identity } from "./identity.js";

export class Cortex {
  constructor(env) {
    this.env = env;
    this.guard = new SchemaGuard();
    this.tools = new Tools(env);
    this.workflows = new Workflows(env, this.tools);
    this.identity = new Identity(env);
  }

  /**
   * process(input, context?)
   * input:  { workflow: string, payload: any, ... }
   * context: { trustZone, subject, claims, threat, mcp, ... }  // optional
   */
  async process(input, context = {}) {
    // 1. Schema validation (AI safety at the edge of Cortex)
    const safe = this.guard.validate(input);
    if (!safe.valid) {
      return {
        ok: false,
        error: "INVALID_AI_REQUEST",
        details: safe.reason
      };
    }

    // 2. Resolve workflow
    const workflow = this.workflows.get(input.workflow);
    if (!workflow) {
      return {
        ok: false,
        error: "UNKNOWN_WORKFLOW",
        workflow: input.workflow
      };
    }

    // 3. Attach identity context (non‑authoritative, for reasoning only)
    const identityContext = await this.identity.buildContext(context);

    // 4. Execute workflow with tools + env + context
    const result = await workflow({
      input,
      env: this.env,
      tools: this.tools,
      identity: identityContext,
      context
    });

    return {
      ok: true,
      workflow: input.workflow,
      result
    };
  }
}
