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
 */

const policies = {

    // --- 1. Public Zone Policy ---
    public: {
        name: "public",

        validate(input) {
            const errors = [];

            // Public zone cannot request sensitive workflows
            const forbiddenWorkflows = [
                "securityAudit",
                "govAdvisory",
                "diagnostics",
                "codeAnalysis"
            ];

            if (forbiddenWorkflows.includes(input.workflow)) {
                errors.push(`Workflow '${input.workflow}' is not allowed in public zone.`);
            }

            // Public zone cannot request internal tools
            if (input.useTools && input.useTools !== "public") {
                errors.push("Public zone may only use public tools.");
            }

            return {
                valid: errors.length === 0,
                errors
            };
        }
    },

    // --- 2. Internal Zone Policy ---
    internal: {
        name: "internal",

        validate(input) {
            const errors = [];

            // Internal zone can run diagnostics, audits, analysis
            const allowedWorkflows = [
                "default",
                "diagnostics",
                "codeAnalysis",
                "simulate",
                "securityAudit",
                "govAdvisory"
            ];

            if (!allowedWorkflows.includes(input.workflow)) {
                errors.push(`Workflow '${input.workflow}' is not permitted in internal zone.`);
            }

            return {
                valid: errors.length === 0,
                errors
            };
        }
    },

    // --- 3. Secure Zone Policy ---
    secure: {
        name: "secure",

        validate(input) {
            const errors = [];

            // Secure zone allows everything EXCEPT:
            // - code execution
            // - external writes
            // - system-level actions
            const forbiddenActions = [
                "execute",
                "deploy",
                "write",
                "modify"
            ];

            if (forbiddenActions.includes(input.action)) {
                errors.push(`Action '${input.action}' is forbidden in secure zone.`);
            }

            return {
                valid: errors.length === 0,
                errors
            };
        }
    }
};

const publicPolicy = {
  name: "Public Zone Policy",
  validate(input) {
    const errors = [];
    if (input.containsPII) errors.push("PII not allowed in public zone.");
    return { valid: errors.length === 0, errors };
  }
};

const internalPolicy = {
  name: "Internal Zone Policy",
  validate() {
    return { valid: true, errors: [] };
  }
};

const governmentPolicy = {
  name: "Government Zone Policy",
  validate(input) {
    const errors = [];
    if (!input.classification) errors.push("Missing classification level.");
    return { valid: errors.length === 0, errors };
  }
};

export default {
  public: publicPolicy,
  internal: internalPolicy,
  government: governmentPolicy
};

export default policies;
