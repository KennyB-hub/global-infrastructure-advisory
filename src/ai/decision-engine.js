/**
 * Decision Engine v4.0
 * ---------------------
 * Multi-domain routing for Deep Mind AI.
 * Enforces policies, domain isolation, schema validation, and self-healing fallbacks.
 */

import { validateAIOutput } from "./validation/schema-guard.js";
import workflows from "./workflows/index.js";
import policies from "./policies/index.js";
import tools from "./tools/index.js";

import * as MathEngine from "./engines/math.js";
import * as MappingEngine from "./engines/mapping.js";
import * as DataEngine from "./engines/data.js";
import * as LogicEngine from "./engines/logic.js";
import * as GovMappingEngine from "./engines/gov-mapping.js";
import * as GovDataEngine from "./engines/gov-data.js";
import * as ScienceEngine from "./engines/science.js";
// Future: AgDataEngine for farmers/contractors/public
// import * as AgDataEngine from "./engines/ag-data.js";

import { isWorkflowAllowed, isEngineAllowed } from "./domain-rules.js";

/**
 * Domain classifier
 */
export function classifyDomain(inputText = "") {
  const text = inputText.toLowerCase();

  // Infrastructure / government
  if (text.includes("zoning") || text.includes("permit") || text.includes("municipal") || text.includes("federal")) {
    return "gov_infrastructure_workflow";
  }
  if (text.includes("public works") || text.includes("utility") || text.includes("road") || text.includes("bridge")) {
    return "public_infrastructure_workflow";
  }

  // Engines
  if (text.includes("calculate") || text.includes("math")) return "math_engine";
  if (text.includes("map") || text.includes("location") || text.includes("gis")) return "mapping_engine";
  if (text.includes("dataset") || text.includes("table") || text.includes("statistics")) return "data_engine";
  if (text.includes("logic") || text.includes("reason")) return "logic_engine";
  if (text.includes("fema") || text.includes("flood") || text.includes("zoning map")) return "gov_mapping_engine";
  if (text.includes("census") || text.includes("traffic data") || text.includes("crash data")) return "gov_data_engine";
  if (text.includes("soil") || text.includes("crop") || text.includes("water test") || text.includes("public safety")) {
    return "science_engine";
  }
  // Future: ag data
  // if (text.includes("farm") || text.includes("yield") || text.includes("field")) return "ag_data_engine";

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
      success: false,
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
      success: false,
      error: `No policy defined for trust zone: ${trustZone}`,
      trustZone
    };
  }

  const policyCheck = policy.validate(input);
  if (!policyCheck.valid) {
    return {
      success: false,
      error: "Policy violation",
      details: policyCheck.errors,
      trustZone
    };
  }

  // --- 4. Determine domain ---
  const domain = classifyDomain(input.query || "");
  log("Domain classified as:", domain);

  // --- 5. Domain isolation checks ---
  const isEngineDomain =
    domain.endsWith("_engine");

  if (isEngineDomain) {
    if (!isEngineAllowed(trustZone, domain)) {
      log("Engine not allowed in this trust zone. Falling back.");
      return await selfHealFallback(input, trustZone, "Engine not allowed by domain rules.");
    }
  } else {
    if (!isWorkflowAllowed(trustZone, domain)) {
      log("Workflow not allowed in this trust zone. Falling back.");
      return await selfHealFallback(input, trustZone, "Workflow not allowed by domain rules.");
    }
  }

  // --- 6. Execute engine or workflow ---
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

      case "gov_mapping_engine":
        result = await GovMappingEngine.run(input);
        break;

      case "gov_data_engine":
        result = await GovDataEngine.run(input);
        break;

      case "science_engine":
        result = await ScienceEngine.run(input);
        break;

      // case "ag_data_engine":
      //   result = await AgDataEngine.run(input);
      //   break;

      default: {
        const workflow = workflows[domain] || workflows["default"];
        if (!workflow) {
          log("Workflow not found. Falling back.");
          return await selfHealFallback(input, trustZone, `Workflow '${domain}' not found.`);
        }
        log("Selected workflow:", domain);
        result = await workflow.run(input, tools);
      }
    }
  } catch (err) {
    log("Execution error:", err.message);
    return await selfHealFallback(input, trustZone, "Execution failed: " + err.message);
  }

  // --- 7. Validate AI output with schema guard ---
  const validation = validateAIOutput(result);

  if (!validation.valid) {
    log("Schema validation failed:", validation.errors);
    return await selfHealFallback(input, trustZone, "Schema validation failed.", validation.errors);
  }

  // --- 8. Return safe, validated output ---
  log("Decision engine completed successfully.");
  return {
    success: true,
    output: result,
    trustZone
  };
}

/**
 * Self-healing fallback:
 * If something breaks (policy, domain rules, workflow missing, schema),
 * fall back to a safe, general reasoning path.
 */
async function selfHealFallback(input, trustZone, reason, details = []) {
  console.warn("[DECISION][SELF-HEAL]", reason, details);

  const safeWorkflow = "general_reasoning";
  const fallback = workflows[safeWorkflow];

  if (!fallback) {
    return {
      success: false,
      error: "Critical: fallback workflow 'general_reasoning' not found.",
      reason,
      details,
      trustZone
    };
  }

  let result;
  try {
    result = await fallback.run(
      {
        ...input,
        selfHealReason: reason,
        selfHealDetails: details
      },
      tools
    );
  } catch (err) {
    return {
      success: false,
      error: "Fallback workflow failed.",
      reason,
      details: [...details, err.message],
      trustZone
    };
  }

  const validation = validateAIOutput(result);

  if (!validation.valid) {
    return {
      success: false,
      error: "Fallback output failed schema validation.",
      reason,
      details: validation.errors,
      trustZone
    };
  }

  return {
    success: true,
    output: result,
    trustZone,
    selfHealed: true,
    selfHealReason: reason
  };
}

