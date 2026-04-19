/**
 * Decision Engine v3.0
 * ---------------------
 * Multi‑domain routing logic for Deep Mind AI.
 * Supports: workflows, math engine, mapping engine, data engine, logic engine.
 * Enforces policies, trust zones, schema validation, and safe execution.
 */

import { validateAIOutput } from "./validation/schema-guard.js";
import workflows from "./workflow/index.js";
import policies from "./policies/index.js";
import tools from "./tools/index.js";

// New engines
import * as MathEngine from "./engines/math.js";
import * as MappingEngine from "./engines/mapping.js";
import * as DataEngine from "./engines/data.js";
import * as LogicEngine from "./engines/logic.js";

/**
 * Domain classifier — Seven‑of‑Nine style logic node
 */
export function classifyDomain(inputText = "") {
  const text = inputText.toLowerCase();

  if (text.includes("contractor")) return "contractor_workflow";
  if (text.includes("risk")) return "risk_workflow";
  if (text.includes("traffic")) return "traffic_flow";
  if (text.includes("agriculture")) return "agriculture_logic";

  // New domains
  if (text.includes("calculate") || text.includes("math")) return "math_engine";
  if (text.includes("map") || text.includes("location")) return "mapping_engine";
  if (text.includes("data") || text.includes("dataset")) return "data_engine";
  if (text.includes("logic") || text.includes("reason")) return "logic_engine";

  return "general_reasoning";
}

/**
 * Main Decision Engine
 */
export async function runDecisionEngine(input) {
  const log = (...args) => console.log("[DECISION]", ...args);

  log("Received input:", input);

  // --- 1. Validate input structure ---
  if (!input || typeof input !== "object") {
    return {
      error: "Invalid input format. Expected an object.",
      trustZone: "public"
    };
  }

  // --- 2. Determine trust zone ---
  const trustZone = input.trustZone || "public";
  log("Trust zone:", trustZone);

  // --- 3. Apply policy rules ---
  const policy = policies[trustZone];
  if (!policy) {
    return {
      error: `No policy defined for trust zone: ${trustZone}`,
      trustZone
    };
  }

  log("Applying policy:", policy.name);

  const policyCheck = policy.validate(input);
  if (!policyCheck.valid) {
    return {
      error: "Policy violation",
      details: policyCheck.errors,
      trustZone
    };
  }

  // --- 4. Determine domain ---
  const domain = classifyDomain(input.query || "");
  log("Domain classified as:", domain);

  // --- 5. Route to correct engine or workflow ---
  let result;

  try {
    switch (domain) {
      case "math_engine":
        result = await MathEngine.run(input);
        break;

      case "mapping_engine":
        result = await MappingEngine.run(input);
        break;

      case "data_engine":
        result = await DataEngine.run(input);
        break;

      case "logic_engine":
        result = await LogicEngine.run(input);
        break;

      default:
        // Fallback to workflow system
        const workflow = workflows[domain] || workflows["default"];
        if (!workflow) {
          return {
            error: `Workflow '${domain}' not found.`,
            trustZone
          };
        }
        log("Selected workflow:", domain);
        result = await workflow.run(input, tools);
    }
  } catch (err) {
    return {
      error: "Execution failed",
      details: err.message,
      trustZone
    };
  }

  // --- 6. Validate AI output with schema guard ---
  const validation = validateAIOutput(result);

  if (!validation.valid) {
    return {
      error: "Schema validation failed",
      details: validation.errors,
      trustZone
    };
  }

  // --- 7. Return safe, validated output ---
  log("Decision engine completed successfully.");
  return {
    success: true,
    output: result,
    trustZone
  };
}
