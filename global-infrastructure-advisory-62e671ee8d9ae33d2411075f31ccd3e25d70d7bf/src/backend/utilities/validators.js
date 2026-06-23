// src/backend/utils/validator.js
// GIA Sovereign Validator – V12 Alpha

import { makeOk, makeError, sha256 } from "./context.js";

const TRUST_LEVELS = {
  public: 1,
  contractor: 2,
  farmer: 2,
  employee: 3,
  admin: 4,
  gov: 5,
  deepgov: 6,
  system: 7
};

export async function validatePayload(env, payload, schema = {}) {
  if (!payload || typeof payload !== "object") {
    return makeError("Invalid payload: expected object", env, { receivedType: typeof payload });
  }

  const errors = [];

  for (const [field, rule] of Object.entries(schema)) {
    const value = payload[field];

    if (rule.required && (value === undefined || value === null)) {
      errors.push({ field, error: "required" });
      continue;
    }
    if (value === undefined || value === null) continue;

    if (rule.type && typeof value !== rule.type) {
      errors.push({ field, error: "type", expected: rule.type, actual: typeof value });
    }

    if (rule.enum && !rule.enum.includes(value)) {
      errors.push({ field, error: "enum", allowed: rule.enum, actual: value });
    }

    if (rule.min !== undefined && value < rule.min) {
      errors.push({ field, error: "min", min: rule.min, actual: value });
    }

    if (rule.max !== undefined && value > rule.max) {
      errors.push({ field, error: "max", max: rule.max, actual: value });
    }

    if (rule.pattern && typeof value === "string" && !rule.pattern.test(value)) {
      errors.push({ field, error: "pattern", pattern: rule.pattern.toString(), actual: value });
    }
  }

  if (errors.length) {
    return makeError("Payload validation failed", env, { errors, schema });
  }

  return makeOk({ valid: true, payload }, env, {
    validation_hash: await sha256(JSON.stringify({ payload, schema }))
  });
}

export async function validateTrustZone(env, zone, minLevel = 1) {
  const level = TRUST_LEVELS[zone] || 0;
  if (level < minLevel) {
    return makeError("Insufficient trust level", env, { zone, level, required: minLevel });
  }
  return makeOk({ zone, level }, env);
}

export async function validateThreat(env, threat) {
  const schema = {
    riskLevel: { required: true, type: "string", enum: ["low", "medium", "high", "critical"] },
    sector: { required: true, type: "string" },
    categories: { required: true, type: "object" }
  };
  return validatePayload(env, threat, schema);
}

export async function validateEndpoint(env, endpoint) {
  const schema = {
    path: { required: true, type: "string", pattern: /^\/[a-zA-Z0-9\-_/]*$/ },
    method: { required: true, type: "string", enum: ["GET", "POST", "PUT", "PATCH", "DELETE"] }
  };
  return validatePayload(env, endpoint, schema);
}
