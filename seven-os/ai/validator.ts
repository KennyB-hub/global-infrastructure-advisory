// seven-os/ai/validator.ts
// GIA Sovereign Validator – V12 Alpha (TypeScript Version)

import { makeOk, makeError, sha256 } from "./context.js";

// ---- Trust Levels ----

export const TRUST_LEVELS: Record<string, number> = {
  public: 1,
  contractor: 2,
  farmer: 2,
  employee: 3,
  admin: 4,
  gov: 5,
  deepgov: 6,
  system: 7,
  sovereign: 8
};

// ---- Types ----

export interface ValidationRule {
  required?: boolean;
  type?: "string" | "number" | "boolean" | "object";
  enum?: any[];
  min?: number;
  max?: number;
  pattern?: RegExp;
}

export interface ValidationSchema {
  [field: string]: ValidationRule;
}

export interface EnvContext {
  [key: string]: any;
}

export interface Payload {
  [key: string]: any;
}

// ---- Payload Validator ----

export async function validatePayload(
  env: EnvContext,
  payload: Payload,
  schema: ValidationSchema = {}
) {
  if (!payload || typeof payload !== "object") {
    return makeError("Invalid payload: expected object", env, {
      receivedType: typeof payload
    });
  }

  const errors: any[] = [];

  for (const [field, rule] of Object.entries(schema)) {
    const value = payload[field];

    // Required check
    if (rule.required && (value === undefined || value === null)) {
      errors.push({ field, error: "required" });
      continue;
    }

    if (value === undefined || value === null) continue;

    // Type check
    if (rule.type && typeof value !== rule.type) {
      errors.push({
        field,
        error: "type",
        expected: rule.type,
        actual: typeof value
      });
    }

    // Enum check
    if (rule.enum && !rule.enum.includes(value)) {
      errors.push({
        field,
        error: "enum",
        allowed: rule.enum,
        actual: value
      });
    }

    // Min check
    if (rule.min !== undefined && value < rule.min) {
      errors.push({
        field,
        error: "min",
        min: rule.min,
        actual: value
      });
    }

    // Max check
    if (rule.max !== undefined && value > rule.max) {
      errors.push({
        field,
        error: "max",
        max: rule.max,
        actual: value
      });
    }

    // Pattern check
    if (rule.pattern && typeof value === "string" && !rule.pattern.test(value)) {
      errors.push({
        field,
        error: "pattern",
        pattern: rule.pattern.toString(),
        actual: value
      });
    }
  }

  if (errors.length) {
    return makeError("Payload validation failed", env, { errors, schema });
  }

  return makeOk(
    { valid: true, payload },
    env,
    {
      validation_hash: await sha256(JSON.stringify({ payload, schema }))
    }
  );
}

// ---- Trust Zone Validator ----

export async function validateTrustZone(
  env: EnvContext,
  zone: string,
  minLevel: number = 1
) {
  const level = TRUST_LEVELS[zone] || 0;

  if (level < minLevel) {
    return makeError("Insufficient trust level", env, {
      zone,
      level,
      required: minLevel
    });
  }

  return makeOk({ zone, level }, env);
}

// ---- Threat Validator ----

export async function validateThreat(env: EnvContext, threat: Payload) {
  const schema: ValidationSchema = {
    riskLevel: {
      required: true,
      type: "string",
      enum: ["low", "medium", "high", "critical"]
    },
    sector: { required: true, type: "string" },
    categories: { required: true, type: "object" }
  };

  return validatePayload(env, threat, schema);
}

// ---- Endpoint Validator ----

export async function validateEndpoint(env: EnvContext, endpoint: Payload) {
  const schema: ValidationSchema = {
    path: {
      required: true,
      type: "string",
      pattern: /^\/[a-zA-Z0-9\-_/]*$/
    },
    method: {
      required: true,
      type: "string",
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    }
  };

  return validatePayload(env, endpoint, schema);
}
