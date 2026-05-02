// /backend/ai/cortex.js
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

  async process(input) {
    const safe = this.guard.validate(input);
    if (!safe.valid) {
      return { error: "Invalid AI request", details: safe.reason };
    }

    const workflow = this.workflows.get(input.workflow);
    if (!workflow) {
      return { error: "Unknown workflow" };
    }

    return await workflow(input);
  }
}
