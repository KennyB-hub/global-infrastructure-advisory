// /ai-engine/policy-engine.js
// GIA Sovereign Policy Engine – V12 Alpha

import { sha256 } from "../../system/ai-context.js";

//
// 7 Sovereign Trust Zones
//
const ZONES = {
  public: 1,
  contractor: 2,
  farmer: 2,
  employee: 3,
  admin: 4,
  gov: 5,
  deepgov: 6,
  system: 7
};

//
// Workflow restrictions per zone
//
const WORKFLOW_RULES = {
  public: [
    "geo",
    "utility",
    "decision",
    "science",
    "geothermal",
    "renewables",
    "building-code",
    "zoning"
  ],

  contractor: [
    "geo",
    "utility",
    "decision",
    "science",
    "renewables",
    "building-code",
    "zoning"
  ],

  farmer: [
    "geo",
    "utility",
    "decision",
    "renewables",
    "geothermal"
  ],

  employee: [
    "geo",
    "utility",
    "decision",
    "science",
    "renewables",
    "building-code",
    "zoning",
    "geothermal"
  ],

  admin: [
    "geo",
    "utility",
    "decision",
    "science",
    "renewables",
    "building-code",
    "zoning",
    "geothermal",
    "sandbox"
  ],

  gov: [
    "geo",
    "utility",
    "decision",
    "science",
    "renewables",
    "building-code",
    "zoning",
    "geothermal",
    "sandbox"
  ],

  deepgov: [
    "geo",
    "utility",
    "decision",
    "science",
    "renewables",
    "building-code",
    "zoning",
    "geothermal",
    "sandbox"
  ],

  system: [
    "geo",
    "utility",
    "decision",
    "science",
    "renewables",
    "building-code",
    "zoning",
    "geothermal",
    "sandbox"
  ]
};

//
// Forbidden actions per zone
//
const ACTION_RULES = {
  public: ["execute", "deploy", "write", "modify"],
  contractor: ["execute", "deploy", "write", "modify"],
  farmer: ["execute", "deploy", "write", "modify"],
  employee: ["execute", "deploy"],
  admin: ["deploy"],
  gov: ["deploy"],
  deepgov: [],
  system: []
};

//
// Main policy engine
//
export async function applyPolicies(input = {}, context = {}) {
  const zone = input.trustZone || "public";
  const level = ZONES[zone] || 1;

  const errors = [];
  const warnings = [];

  //
  // 1. Workflow validation
  //
  const workflow = input.workflow || context.workflow || "general";
  const allowedWorkflows = WORKFLOW_RULES[zone];

  if (!allowedWorkflows.includes(workflow)) {
    errors.push(`Workflow '${workflow}' is not permitted in trust zone '${zone}'.`);
  }

  //
  // 2. Action validation
  //
  if (input.action) {
    const forbidden = ACTION_RULES[zone];
    if (forbidden.includes(input.action)) {
      errors.push(`Action '${input.action}' is forbidden in trust zone '${zone}'.`);
    }
  }

  //
  // 3. DeepGov override mode
  //
  if (zone === "deepgov" && errors.length > 0) {
    warnings.push(...errors);
    errors.length = 0;
  }

  //
  // 4. Build sovereign policy result
  //
  const result = {
    ok: errors.length === 0,
    errors,
    warnings,
    trustZone: zone,
    workflow,
    level,
    timestamp: new Date().toISOString(),
    inputHash: context.inputHash || null,
    contextHash: context.contextHash || null
  };

  //
  // 5. Integrity hash
  //
  result.integrity = {
    hash: await sha256(JSON.stringify(result)),
    verified: true
  };

  return result;
}
