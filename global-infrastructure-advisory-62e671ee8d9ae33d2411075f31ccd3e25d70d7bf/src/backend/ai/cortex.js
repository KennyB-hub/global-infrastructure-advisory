// backend/ai/cortex.js
// GIA Cortex v12 — Sovereign Reasoning Engine

import { SchemaGuard } from "./schema-guard.js";
import { ToolsV12 } from "./tools/index.js";
import { Workflows } from "./workflows.js";
import { Identity } from "./identity.js";

export class Cortex {
  constructor(env) {
    this.env = env;
    this.guard = new SchemaGuard();
    this.tools = new ToolsV12(env);     // ← NEW
    this.workflows = new Workflows(env, this.tools);
    this.identity = new Identity(env);
  }

  async process(input, context = {}) {
    const safe = this.guard.validate(input);
    if (!safe.valid) {
      return { ok: false, error: "INVALID_AI_REQUEST", details: safe.reason };
    }

    const workflow = this.workflows.get(input.workflow);
    if (!workflow) {
      return { ok: false, error: "UNKNOWN_WORKFLOW", workflow: input.workflow };
    }

    const identityContext = await this.identity.buildContext(context);

    const result = await workflow({
      input,
      env: this.env,
      tools: this.tools,        // ← NEW
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
