// backend/system/mcp/mcp-evaluator.js
import { mcpPolicies } from "./mcp-policy-registry.js";

export function evaluateMCP({ policyName, trustZone, method, threatLevel }) {
  const policy = mcpPolicies[policyName] || mcpPolicies.default;

  if (!policy.allowedMethods.includes(method)) {
    return { allowed: false, reason: "Method not allowed by MCP" };
  }

  if (!policy.allowedTrustZones.includes(trustZone)) {
    return { allowed: false, reason: "TrustZone not allowed by MCP" };
  }

  if (policy.denyHighThreat && (threatLevel === "high" || threatLevel === "critical")) {
    return { allowed: false, reason: "High threat level blocked by MCP" };
  }

  return { allowed: true, policy: policyName };
}
