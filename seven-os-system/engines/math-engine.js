// /ai-engine/math-engine.js
// GIA Sovereign Math Engine – V12 Alpha

import {
  sha256,
  getPlatformContext,
  getNodeContext,
  getClusterContext,
  getAIContext
} from "../utils/context.js";

import { validatePayload } from "../utils/validator.js";

export class MathEngine {

  //
  // 1. Sovereign entrypoint for math tasks
  //
  async process(input = {}, env = {}, context = {}) {
    //
    // Validate input schema
    //
    const schemaCheck = await validatePayload(env, input, {
      task: { required: true, type: "string" },
      values: { required: false, type: "object" },
      weights: { required: false, type: "object" },
      lat1: { required: false, type: "string" },
      lon1: { required: false, type: "string" },
      lat2: { required: false, type: "string" },
      lon2: { required: false, type: "string" }
    });
    if (!schemaCheck.ok) return schemaCheck;

    //
    // Execute requested math task
    //
    let result;
    try {
      result = await this._execute(input);
    } catch (err) {
      return await this._wrapError("math-error", err, context, env);
    }

    //
    // Wrap with sovereign metadata + integrity
    //
    return await this._wrap(result, context, env);
  }

  //
  // 2. Task dispatcher
  //
  async _execute(input) {
    const task = input.task.toLowerCase();

    switch (task) {
      case "distance":
        return this._distanceTask(input);
      case "weighted-score":
        return this._weightedScoreTask(input);
      case "normalize":
        return this._normalizeTask(input);
      default:
        return { message: `Unknown math task: ${task}` };
    }
  }

  //
  // 3. Haversine distance (meters)
  //
  _distanceTask(input) {
    const lat1 = parseFloat(input.lat1);
    const lon1 = parseFloat(input.lon1);
    const lat2 = parseFloat(input.lat2);
    const lon2 = parseFloat(input.lon2);

    const meters = this.distance(lat1, lon1, lat2, lon2);

    return {
      message: `Distance computed: ${meters.toFixed(2)} meters`,
      meta: { lat1, lon1, lat2, lon2, meters }
    };
  }

  distance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = d => (d * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  //
  // 4. Weighted scoring
  //
  _weightedScoreTask(input) {
    const values = input.values || [];
    const weights = input.weights || [];

    const score = this.weightedScore(values, weights);

    return {
      message: `Weighted score computed: ${score}`,
      meta: { values, weights, score }
    };
  }

  weightedScore(values, weights) {
    return values.reduce((sum, v, i) => sum + v * (weights[i] || 1), 0);
  }

  //
  // 5. Normalization
  //
  _normalizeTask(input) {
    const value = parseFloat(input.value);
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);

    const normalized = this.normalize(value, min, max);

    return {
      message: `Normalized value: ${normalized}`,
      meta: { value, min, max, normalized }
    };
  }

  normalize(value, min, max) {
    if (max === min) return 0;
    return (value - min) / (max - min);
  }

  //
  // 6. Sovereign wrappers
  //
  async _wrap(result, context, env) {
    const payload = {
      ok: true,
      type: "math",
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

  async _wrapError(type, err, context, env) {
    const payload = {
      ok: false,
      type,
      error: err?.message || "Unknown math engine error",
      timestamp: new Date().toISOString(),

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
