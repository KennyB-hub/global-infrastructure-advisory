// /ai-engine/logic-engine.js
// GIA Sovereign Logic Engine – V12 Alpha

import { sha256 } from "../utils/context.js";
import { validatePayload } from "../utils/validator.js";

export class LogicEngine {

  //
  // 1. Sovereign Rule Evaluator
  //
  async evaluateRules(rules = [], context = {}, env = {}) {
    for (const rule of rules) {
      try {
        if (rule.when(context)) {
          const result = await rule.then(context);
          return await this._wrapDecision("rule-match", result, context, env);
        }
      } catch (err) {
        return await this._wrapError("Rule evaluation failed", err, context, env);
      }
    }

    return await this._wrapDecision("rule-none", null, context, env);
  }

  //
  // 2. Priority Resolver (sovereign-safe)
  //
  async resolvePriority(items = [], context = {}, env = {}) {
    if (!Array.isArray(items) || items.length === 0) {
      return await this._wrapDecision("priority-none", null, context, env);
    }

    const sorted = [...items].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    const top = sorted[0];

    return await this._wrapDecision("priority-selected", top, context, env);
  }

  //
  // 3. Sector Router (sovereign-aware)
  //
  async routeToSector(input = "", context = {}, env = {}) {
    const map = {
      "veteran": "vets",
      "education": "education",
      "job": "jobs",
      "contract": "contracts",
      "payment": "payments",
      "hr": "hr"
    };

    const key = String(input).toLowerCase().trim();
    const sector = map[key] || "general";

    return await this._wrapDecision("sector-route", { sector }, context, env);
  }

  //
  // --- INTERNAL SOVEREIGN HELPERS ------------------------------------------
  //

  async _wrapDecision(type, result, context, env) {
    const payload = {
      ok: true,
      type,
      result,
      contextSummary: this._summarizeContext(context),
      timestamp: new Date().toISOString()
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
      error: err?.message || "Unknown logic engine error",
      contextSummary: this._summarizeContext(context),
      timestamp: new Date().toISOString()
    };

    payload.integrity = {
      hash: await sha256(JSON.stringify(payload)),
      verified: true
    };

    return payload;
  }

  _summarizeContext(context = {}) {
    return {
      trustZone: context.trustZone || "public",
      workflow: context.workflow || null,
      inputHash: context.inputHash || null,
      contextHash: context.contextHash || null
    };
  }
}
