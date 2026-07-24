// /ai-engine/building-code-engine.js
// GIA Sovereign Building Code Engine – V12 Alpha

import {
  sha256,
  getPlatformContext,
  getNodeContext,
  getClusterContext,
  getAIContext,
  validatePayload
} from "../general/_shared.js";

export class BuildingCodeEngine {
  async process(input = {}, env = {}, context = {}) {
    const schemaCheck = await validatePayload(env, input, {
      jurisdiction: { required: true, type: "string" }, // e.g. "IBC-2018", "PA-Residential"
      useType: { required: true, type: "string" },      // "residential", "commercial", etc.
      height: { required: false, type: "string" },      // meters
      stories: { required: false, type: "string" }
    });
    if (!schemaCheck.ok) return schemaCheck;

    const result = this._assess(input);

    return this._wrap("building-code", result, env, context);
  }

  _assess(input) {
    const jurisdiction = input.jurisdiction.toUpperCase();
    const useType = input.useType.toLowerCase();
    const stories = input.stories ? parseInt(input.stories, 10) : null;

    const notes = [];

    if (jurisdiction.includes("IBC")) {
      notes.push("Apply IBC structural + fire separation rules.");
    }

    if (useType === "residential" && stories && stories > 3) {
      notes.push("Check mid‑rise residential egress + sprinkler requirements.");
    }

    return {
      message: `Building code baseline for ${jurisdiction}, ${useType}`,
      meta: { jurisdiction, useType, stories, notes }
    };
  }

  async _wrap(type, result, env, context) {
    const payload = {
      ok: true,
      type,
      timestamp: new Date().toISOString(),
      result,
      platform: getPlatformContext(),
      nodes: getNodeContext(),
      clusters: getClusterContext(),
      ai: getAIContext(env),
      context: {
        trustZone: context.trustZone || "public",
        workflow: context.workflow || null,
        inputHash: context.inputHash || null,
        contextHash: context.contextHash || null
      }
    };

    payload.integrity = {
      hash: await sha256(JSON.stringify(payload)),
      verified: true
    };

    return payload;
  }
}
