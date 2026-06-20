// backend/system/mcp/mcp-policy-registry.js

export const mcpPolicies = {
  default: {
    allowedMethods: ["GET", "POST"],
    allowedTrustZones: ["public", "gov", "deepgov"],
    denyHighThreat: true
  },
  deepgov: {
    allowedMethods: ["GET", "POST"],
    allowedTrustZones: ["deepgov"],
    denyHighThreat: true
  }
};
