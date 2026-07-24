// /ai-engine/data-engine.js
// GIA Sovereign Data Engine – V12 Alpha

import {
  sha256,
  getPlatformContext,
  getNodeContext,
  getClusterContext,
  getAIContext
} from "../../backend/utils/context.js";

import { validatePayload } from "../../ai-engines/utils/validator.js";

export class DataEngine {

  //
  // 1. Normalize input fields (sovereign-safe)
  //
  normalize(input = {}) {
    const out = {};

    for (const key of Object.keys(input)) {
      const normalizedKey = key.trim().toLowerCase();

      // Normalize values to strings unless object/array
      const value = input[key];
      if (typeof value === "string") {
        out[normalizedKey] = value.trim();
      } else if (typeof value === "number" || typeof value === "boolean") {
        out[normalizedKey] = String(value);
      } else {
        out[normalizedKey] = value;
      }
    }

    return out;
  }

  //
  // 2. Validate required fields (delegates to sovereign validator)
  //
  async validate(input, required, env) {
    const schema = {};
    for (const field of required) {
      schema[field] = { required: true, type: "string" };
    }
    return validatePayload(env, input, schema);
  }

  //
  // 3. Transform for AI Cortex (sovereign metadata + integrity)
  //
  async transformForAI(input = {}, env = {}) {
    const timestamp = Date.now();

    const normalized = this.normalize(input);

    const transformed = {
      ...normalized,
      timestamp,
      iso: new Date(timestamp).toISOString(),
      source: "GIA-Platform-V12",
      platform: getPlatformContext(),
      nodes: getNodeContext(),
      clusters: getClusterContext(),
      ai: getAIContext(env)
    };

    transformed.integrity = {
      inputHash: await sha256(JSON.stringify(normalized)),
      transformedHash: await sha256(JSON.stringify(transformed)),
      verified: true
    };

    return transformed;
  }
}
