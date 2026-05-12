// backend/system/ewo/ewo-schema.js
// GISA Multi‑Sector EWO Schema (v3)

export const EWOSchema = {
  required: [
    "ewo_id",
    "priority_rank",
    "priority_label",
    "asset_id",
    "lat",
    "lon",
    "region",
    "sector",
    "infra_type",
    "incident_code",
    "incident_description",
    "severity",
    "risk_class",
    "required_action",
    "lead_entity",
    "assigned_units",
    "auth_token",
    "issued_by",
    "routed_via",
    "origin_system"
  ],

  fields: {
    ewo_id: "string",
    priority_rank: "number",
    priority_label: "string",

    asset_id: "string",
    lat: "number",
    lon: "number",
    region: "string",

    sector: "string",          // AI‑generated or predefined
    infra_type: "string",      // tower, fiber, pump, substation, etc.
    cross_sector_impact: "array",

    incident_code: "string",
    incident_description: "string",
    severity: "string",
    risk_class: "string",
    required_action: "string",
    eta_stabilize: "string",

    lead_entity: "string",
    assigned_units: "array",
    auth_token: "string",
    command_channel: "string",

    primary_objective: "string",
    secondary_objectives: "array",
    constraints: "array",
    dependencies: "array",

    issued_by: "string",
    routed_via: "string",
    origin_system: "string"
  }
};

// Simple validator
export function validateEWO(ewo) {
  for (const field of EWOSchema.required) {
    if (!ewo[field]) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }
  return { valid: true };
}
