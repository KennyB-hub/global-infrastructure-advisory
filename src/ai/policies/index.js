/**
 * Policy Engine
 * --------------
 * Defines trust-zone rules for the AI system.
 * Each policy enforces what is allowed, restricted, or blocked.
 *
 * Zones:
 *  - public: lowest trust, safest output only
 *  - internal: operational analysis, diagnostics, audits
 *  - secure: highest trust, restricted to approved operators
 *// Unified Policy Registry
 *// Trust‑zone aware: public, internal, government, secure

const publicPolicy = {
  name: "Public Zone Policy",
  validate(input) {
    const errors = [];

    if (input.containsPII) {
      errors.push("PII not allowed in public zone.");
    }

    if (input.trustZone && input.trustZone !== "public") {
      errors.push("Public zone cannot escalate trust zone.");
    }

    return { valid: errors.length === 0, errors };
  }
};

const internalPolicy = {
  name: "Internal Zone Policy",
  validate(input) {
    const errors = [];

    if (input.escalateTo === "secure" && !input.approver) {
      errors.push("Escalation to secure requires approver.");
    }

    return { valid: errors.length === 0, errors };
  }
};

const governmentPolicy = {
  name: "Government Zone Policy",
  validate(input) {
    const errors = [];

    if (!input.classification) {
      errors.push("Missing classification level for government trust zone.");
    }

    if (!input.agency) {
      errors.push("Missing agency identifier for government trust zone.");
    }

    return { valid: errors.length === 0, errors };
  }
};

const securePolicy = {
  name: "Secure Zone Policy",
  validate(input) {
    const errors = [];

    if (!input.authorizationToken) {
      errors.push("Missing authorization token for secure zone.");
    }

    return { valid: errors.length === 0, errors };
  }
};

export default {
  public: publicPolicy,
  internal: internalPolicy,
  government: governmentPolicy,
  secure: securePolicy
};
