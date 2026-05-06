// /ai-engine/renewables-engine.js
// GIA Sovereign Renewables Engine (Solar + Wind) – V12 Alpha

import {
  sha256,
  getPlatformContext,
  getNodeContext,
  getClusterContext,
  getAIContext,
  validatePayload
} from "./_shared.js";

export class RenewablesEngine {
  async process(input = {}, env = {}, context = {}) {
    const schemaCheck = await validatePayload(env, input, {
      lat: { required: true, type: "string" },
      lon: { required: true, type: "string" },
      type: { required: true, type: "string" } // "solar" | "wind" | "hybrid"
    });
    if (!schemaCheck.ok) return schemaCheck;

    const t = input.type.toLowerCase();
    let result;

    if (t === "solar") result = this._solar(input);
    else if (t === "wind") result = this._wind(input);
    else result = this._hybrid(input);

    return this._wrap("renewables", result, env, context);
  }

  _solar(input) {
    const lat = parseFloat(input.lat);
    const lon = parseFloat(input.lon);

    const band =
      Math.abs(lat) < 25 ? "very-high" :
      Math.abs(lat) < 40 ? "high" :
      "medium";

    return {
      message: `Solar potential: ${band}`,
      meta: { lat, lon, band, type: "solar" }
    };
  }

  _wind(input) {
    const lat = parseFloat(input.lat);
    const lon = parseFloat(input.lon);

    const band =
      Math.abs(lat) > 35 && Math.abs(lat) < 65 ? "high" :
      "medium";

    return {
      message: `Wind potential: ${band}`,
      meta: { lat, lon, band, type: "wind" }
    };
  }

  _hybrid(input) {
    const solar = this._solar(input);
    const wind = this._wind(input);

    return {
      message: `Hybrid solar+wind assessment`,
      meta: { solar, wind, type: "hybrid" }
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
