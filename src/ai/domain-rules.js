// Domain Isolation Rules
// Controls which workflows / engines are allowed in which trust zones.

const rules = {
  public: {
    allowedWorkflows: ["public_infrastructure_workflow", "general_reasoning"],
    allowedEngines: ["math_engine", "mapping_engine", "data_engine", "logic_engine"]
  },
  internal: {
    allowedWorkflows: [
      "public_infrastructure_workflow",
      "gov_infrastructure_workflow",
      "general_reasoning"
    ],
    allowedEngines: [
  "math_engine",
  "mapping_engine",
  "data_engine",
  "logic_engine",
  "gov_mapping_engine",
  "gov_data_engine",
  "science_engine",
  "ag_data_engine"  
]
  },
  government: {
    allowedWorkflows: ["gov_infrastructure_workflow"],
    allowedEngines: [
      "math_engine",
      "mapping_engine",
      "data_engine",
      "logic_engine",
      "gov_mapping_engine",
      "gov_data_engine"
    ]
  },
  secure: {
    allowedWorkflows: ["gov_infrastructure_workflow"],
    allowedEngines: [
      "math_engine",
      "mapping_engine",
      "data_engine",
      "logic_engine",
      "gov_mapping_engine",
      "gov_data_engine"
    ]
  }
};

export function isWorkflowAllowed(trustZone, workflowName) {
  const zone = rules[trustZone] || rules.public;
  return zone.allowedWorkflows.includes(workflowName);
}

export function isEngineAllowed(trustZone, engineName) {
  const zone = rules[trustZone] || rules.public;
  return zone.allowedEngines.includes(engineName);
}
