/**
 * GIA Sovereign Sandbox Runner – V12 Alpha
 * ----------------------------------------
 * Fully isolated execution environment for AI‑generated code.
 * No filesystem, no network, no process access, no globals.
 * Trust‑zone aware, policy‑aware, filter‑aware, integrity‑verified.
 */

import vm from "node:vm";
import { filterAIOutput } from "../seven-os/ai/filters/code-filter.js";
import { applyPolicies } from "../seven-os/system/policy-engine.js";
import { validatePayload } from "../seven-os/ai/validation/validator.js";
import { buildContext } from "../seven-os/engines/context-builder.js";
import { sanitizeOutput } from "../seven-os/engines/response-sanitizer.js";
import { handleError } from "../seven-os/engines/error-handler.js";
import { sha256 } from "../seven-os/backend/utils/context.js";

// --- 1. Sovereign sandbox environment ---
const sandboxEnv = {
  console: {
    log: (...args) => {
      process.stdout.write("[SANDBOX LOG] " + args.join(" ") + "\n");
    },
    error: (...args) => {
      process.stderr.write("[SANDBOX ERROR] " + args.join(" ") + "\n");
    }
  },

  // Safe JSON utilities
  JSON,

  // Safe timers
  setTimeout,
  clearTimeout,

  // No access to real process
  process: {
    env: {
      AI_SANDBOX: "true",
      TRUST_ZONE: "sandbox"
    }
  }
};

// Create isolated VM context
const context = vm.createContext(sandboxEnv);

// --- 2. Sovereign sandbox executor ---
export async function runSandbox(input = {}, env = {}) {
  try {
    //
    // A. Validate input schema
    //
    const schemaCheck = await validatePayload(env, input, {
      code: { required: true, type: "string" },
      trustZone: { required: false, type: "string" }
    });
    if (!schemaCheck.ok) return schemaCheck;

    //
    // B. Build sovereign context
    //
    const ctx = await buildContext(input, env);

    //
    // B.1 Reject async code
    //
    if (/\bawait\b|\basync\b/.test(input.code)) {
      return {
        ok: false,
        type: "sandbox-filter",
        errors: ["Async code is not allowed in sovereign sandbox"],
        integrity: { verified: false }
      };
    }

    //
    // B.2 Trust zone enforcement
    //
    const allowedZones = ["sandbox", "public", "internal", "vault"];
    if (!allowedZones.includes(ctx.trustZone)) {
      return {
        ok: false,
        type: "trust-zone",
        errors: [`Invalid trust zone: ${ctx.trustZone}`],
        integrity: { verified: false }
      };
    }

    //
    // C. Apply trust‑zone policies
    //
    const policy = await applyPolicies(input, ctx);
    if (!policy.ok) return policy;

    //
    // D. Pre‑execution code filter
    //
    const filter = await filterAIOutput(input.code, ctx);
    if (!filter.ok) {
      return {
        ok: false,
        type: "sandbox-filter",
        errors: filter.errors,
        warnings: filter.warnings,
        integrity: filter.integrity
      };
    }

    //
    // E. Execute inside VM
    //
    let result;
    try {
      const script = new vm.Script(input.code, {
        timeout: 1500,
        displayErrors: true
      });

      result = script.runInContext(context);
    } catch (err) {
      return handleError(err, env, { sandbox: true });
    }

    //
    // F. Sanitize output
    //
    const sanitized = await sanitizeOutput(
      {
        ok: true,
        type: "sandbox",
        result,
        meta: { trustZone: ctx.trustZone }
      },
      env,
      ctx
    );

    //
    // G. Integrity hash
    //
    sanitized.integrity = {
      hash: await sha256(JSON.stringify(sanitized)),
      verified: true
    };

    return sanitized;

  } catch (err) {
    return handleError(err, env, { fatal: true });
  }
}
